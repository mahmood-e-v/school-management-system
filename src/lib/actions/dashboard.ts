"use server";

import dbConnect from "@/lib/db";
import StudentModel from "@/models/Student";
import ClassModel from "@/models/Class";
import AttendanceModel from "@/models/Attendance";
import ExamModel from "@/models/Exam";

export async function getDashboardStats(dateStr?: string) {
    try {
        await dbConnect();

        // 1. Total Students
        const totalStudents = await StudentModel.countDocuments();

        // 2. Class-wise Data (Students count, Teacher)
        // We can use aggregation or just simple loops. Aggregation is better for counts.
        const classes = await ClassModel.find({}).lean();

        // Count students per class
        const studentCounts = await StudentModel.aggregate([
            { $group: { _id: "$classId", count: { $sum: 1 } } }
        ]);

        // Map counts to classes
        const classData = classes.map((cls: any) => {
            const countObj = studentCounts.find((c) => c._id.toString() === cls._id.toString());
            return {
                _id: cls._id.toString(),
                name: cls.name,
                division: cls.division,
                classTeacher: cls.classTeacher || "Not Assigned",
                studentCount: countObj ? countObj.count : 0,
            };
        });

        // 3. Attendance Logic
        // Default to today if no date provided
        const today = new Date();
        const queryDateStr = dateStr ? dateStr : today.toISOString().split("T")[0]; // YYYY-MM-DD
        const queryDate = new Date(queryDateStr);

        // UTC range for that day
        const startOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 0, 0, 0));
        const endOfDay = new Date(Date.UTC(queryDate.getUTCFullYear(), queryDate.getUTCMonth(), queryDate.getUTCDate(), 23, 59, 59));

        const attendanceRecords = await AttendanceModel.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate("classId", "name division");

        let totalPresent = 0;
        let totalAttendanceRecords = 0; // Total student records checked (Present + Absent)

        // Class-wise attendance stats for this day
        const classAttendanceStats = attendanceRecords.map((att: any) => {
            const presentCount = att.records.filter((r: any) => r.status === "Present").length;
            const totalRecordCount = att.records.length;

            totalPresent += presentCount;
            totalAttendanceRecords += totalRecordCount;

            return {
                classId: att.classId._id.toString(),
                className: `${att.classId.name} ${att.classId.division}`,
                present: presentCount,
                total: totalRecordCount,
                percentage: totalRecordCount > 0 ? ((presentCount / totalRecordCount) * 100).toFixed(1) : "0.0"
            };
        });

        const overallAttendancePercentage = totalAttendanceRecords > 0
            ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(1)
            : "0.0";

        // 4. Exams count (Total)
        const totalExams = await ExamModel.countDocuments();

        return {
            totalStudents,
            classData: classData.sort((a: any, b: any) => a.name.localeCompare(b.name)),
            attendance: {
                date: queryDateStr,
                percentage: overallAttendancePercentage,
                details: classAttendanceStats
            },
            totalExams
        };

    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        return { error: "Failed to load dashboard data" };
    }
}
