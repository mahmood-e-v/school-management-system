"use server";

import dbConnect from "@/lib/db";
import AttendanceModel from "@/models/Attendance";
import StudentModel from "@/models/Student";
import { getSchoolSettings, getActiveAcademicYear } from "@/lib/actions/school";

export async function getAttendanceSummary(classId: string, month: number, year: number) {
    try {
        await dbConnect();

        // 1. Determine date range
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of month

        // 2. Fetch all students in class
        const students = await StudentModel.find({ classId }).sort({ rollNo: 1 });

        const academicYear = await getActiveAcademicYear();

        // 3. Fetch attendance records in range
        const attendanceRecords = await AttendanceModel.find({
            classId,
            academicYear,
            date: { $gte: startDate, $lte: endDate },
        });

        const totalDays = attendanceRecords.length;

        // 4. Calculate stats per student
        const summary = students.map((student) => {
            let presentCount = 0;
            let absentCount = 0;

            attendanceRecords.forEach((record) => {
                const studentRecord = record.records.find(
                    (r: any) => r.studentId.toString() === student._id.toString()
                );
                if (studentRecord) {
                    if (studentRecord.status === "Present") presentCount++;
                    else absentCount++;
                }
            });

            const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : "0.0";

            return {
                _id: student._id.toString(),
                name: student.name,
                rollNo: student.rollNo,
                present: presentCount,
                absent: absentCount,
                total: totalDays,
                percentage: parseFloat(percentage),
            };
        });

        return { summary, totalDays };

    } catch (error) {
        console.error("Failed to generate summary:", error);
        return { error: "Failed to generate summary" };
    }
}
