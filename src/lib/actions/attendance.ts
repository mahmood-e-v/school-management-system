"use server";

import dbConnect from "@/lib/db";
import AttendanceModel from "@/models/Attendance";
import StudentModel from "@/models/Student";
import { revalidatePath } from "next/cache";

export async function getAttendanceSheetData(classId: string, date: string) {
    try {
        await dbConnect();

        // Robust Date Logic: Create a range for the whole UTC day
        // This avoids issues where stored date might be slightly off or treated differently
        const queryDate = new Date(date);
        const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59));

        console.log(`Fetching Attendance. Class: ${classId}, Range: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);

        // 1. Fetch Students
        const students = await StudentModel.find({ classId }).sort({ rollNo: 1 });

        // 2. Fetch Existing Attendance
        const existingAttendance = await AttendanceModel.findOne({
            classId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        console.log("Found existing attendance:", !!existingAttendance);

        const studentList = students.map((s) => {
            const existingRecord = existingAttendance?.records.find(
                (r: any) => r.studentId.toString() === s._id.toString()
            );
            return {
                _id: s._id.toString(),
                name: s.name,
                rollNo: s.rollNo,
                status: existingRecord?.status || "Present",
                remark: existingRecord?.remark || "",
            };
        });

        return { students: studentList, attendanceId: existingAttendance?._id?.toString() };
    } catch (error) {
        console.error("Failed to fetch attendance sheet:", error);
        return { error: "Failed to load data" };
    }
}

export async function saveAttendance(formData: FormData) {
    try {
        await dbConnect();
        const classId = formData.get("classId") as string;
        const dateStr = formData.get("date") as string;

        if (!classId || !dateStr) return { error: "Missing class or date" };

        // Normalize Date to UTC Midnight strictly
        const queryDate = new Date(dateStr);
        // We want to save it as UTC Midnight explicitly
        // If we use new Date("2023-12-14"), it is UTC midnight.
        // Let's stick to that but ensure we don't accidentally shift properties.
        const saveDate = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0));

        console.log(`Saving Attendance. Class: ${classId}, SaveDate: ${saveDate.toISOString()}`);

        const students = await StudentModel.find({ classId }).select("_id name"); // Fetch name for debug
        const records = students.map(student => {
            const id = student._id.toString();
            // Checkbox "on" means Present (checked).
            const rawValue = formData.get(`status-${id}`);
            const isPresent = rawValue === "on";
            const remark = formData.get(`remark-${id}`) as string;

            // console.log(`Student ${student.name} (${id}): Raw=${rawValue}, isPresent=${isPresent}`);

            return {
                studentId: student._id,
                status: isPresent ? "Present" : "Absent",
                remark,
            };
        });

        // Use findOneAndUpdate with the same Date Range logic to ensure we update the correct day's record
        // instead of creating duplicates if time somehow differs.
        const startOfDay = new Date(saveDate);
        const endOfDay = new Date(saveDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // First try to find existing to update
        let doc = await AttendanceModel.findOne({
            classId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (doc) {
            console.log("Updating existing document:", doc._id);
            doc.records = records;
            // doc.date = saveDate; // Keep original date or normalize? Let's keep normalized.
            await doc.save();
        } else {
            console.log("Creating new document");
            doc = await AttendanceModel.create({
                classId,
                date: saveDate,
                records
            });
        }

        console.log("Saved Attendance Doc ID:", doc._id);

        revalidatePath("/dashboard/attendance");
        return { success: true };
    } catch (error) {
        console.error("Failed to save attendance:", error);
        return { error: "Failed to save attendance" };
    }
}

export async function getMonthlyAttendance(classId: string, month: number, year: number) {
    try {
        await dbConnect();

        // Month is 0-indexed in JS Date, but commonly 1-indexed in UI. Let's assume passed as 0-11.
        const startOfMonth = new Date(Date.UTC(year, month, 1));
        const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

        console.log(`Fetching Monthly Report: Class ${classId}, ${startOfMonth.toISOString()} - ${endOfMonth.toISOString()}`);

        const daysInMonth = endOfMonth.getUTCDate();

        // 1. Fetch all students in class
        const students = await StudentModel.find({ classId }).select("name rollNo").sort({ rollNo: 1 }).lean();

        // 2. Fetch all attendance records for this class & month
        const attendanceRecords = await AttendanceModel.find({
            classId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        // 3. Transform into a matrix
        // Result: Array of { studentName, rollNo, attendance: { day1: 'P', day2: 'A', ... }, stats: { present: 10, absent: 2 } }

        const reportData = students.map((msgStudent: any) => {
            const studentId = msgStudent._id.toString();
            const dailyStatus: Record<number, string> = {};
            let presentCount = 0;
            let absentCount = 0;

            attendanceRecords.forEach((record: any) => {
                const day = new Date(record.date).getUTCDate();
                const studentRecord = record.records.find((r: any) => r.studentId.toString() === studentId);

                if (studentRecord) {
                    const status = studentRecord.status === "Present" ? "P" : "A";
                    dailyStatus[day] = status;
                    if (status === "P") presentCount++;
                    else absentCount++;
                }
            });

            return {
                name: msgStudent.name,
                rollNo: msgStudent.rollNo,
                dailyStatus,
                stats: {
                    present: presentCount,
                    absent: absentCount,
                    total: presentCount + absentCount
                }
            };
        });

        return { success: true, data: reportData, daysInMonth };

    } catch (error) {
        console.error("Monthly report error:", error);
        return { error: "Failed to generate report" };
    }
}

export async function getStudentAttendance(studentId: string) {
    try {
        await dbConnect();
        // Fetch all time attendance for this student
        // We need to find all Attendance Docs where this student exists in 'records'

        const records = await AttendanceModel.find({
            "records.studentId": studentId
        }).select("date records").sort({ date: -1 }).lean();

        const history = records.map((doc: any) => {
            const studentRecord = doc.records.find((r: any) => r.studentId.toString() === studentId);
            return {
                date: doc.date,
                status: studentRecord?.status || "Unknown",
                remark: studentRecord?.remark || ""
            };
        });

        const stats = {
            present: history.filter(h => h.status === "Present").length,
            absent: history.filter(h => h.status === "Absent").length,
            total: history.length
        };

        return { success: true, history, stats };

    } catch (error) {
        console.error("Student report error:", error);
        return { error: "Failed to fetch student history" };
    }
}
