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
        }); // Removed populate because we will iterate over `classData` to get class names/details

        let totalPresentAll = 0;
        let totalStudentsAll = 0; // Total strength of all classes combined

        // Map over ALL classes to ensure we show a row for every class
        const classAttendanceStats = classData.map((cls: any) => {
            // Find attendance record for this class
            const attRecord = attendanceRecords.find((r: any) => r.classId.toString() === cls._id);

            const totalStudentsInClass = cls.studentCount || 0;
            totalStudentsAll += totalStudentsInClass;

            if (attRecord) {
                const presentCount = attRecord.records.filter((r: any) => r.status === "Present").length;
                totalPresentAll += presentCount;

                return {
                    classId: cls._id,
                    className: `${cls.name} ${cls.division}`,
                    present: presentCount,
                    total: totalStudentsInClass,
                    percentage: totalStudentsInClass > 0
                        ? ((presentCount / totalStudentsInClass) * 100).toFixed(1)
                        : "0.0"
                };
            } else {
                // No attendance marked for this class
                return {
                    classId: cls._id,
                    className: `${cls.name} ${cls.division}`,
                    present: "-",
                    total: totalStudentsInClass,
                    percentage: "-"
                };
            }
        });

        // Overall Percentage: (Total Present across all classes / Total Students in all classes)
        // Only count if there are students, otherwise 0
        const overallAttendancePercentage = totalStudentsAll > 0
            ? ((totalPresentAll / totalStudentsAll) * 100).toFixed(1)
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
        // Return safe default values so the UI doesn't crash
        return {
            totalStudents: 0,
            classData: [],
            attendance: {
                date: dateStr || new Date().toISOString().split("T")[0],
                percentage: "0.0",
                details: []
            },
            totalExams: 0,
            error: "Failed to load dashboard data. Please check database connection."
        };
    }
}
