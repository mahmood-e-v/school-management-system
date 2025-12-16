"use server";

import dbConnect from "@/lib/db";
import AttendanceModel from "@/models/Attendance";
import ExamModel from "@/models/Exam";
import ResultModel from "@/models/Result";
import ClassModel from "@/models/Class";

export async function getAnalyticsData() {
    try {
        await dbConnect();

        // 1. Attendance Trend (Last 7 days for whole school)
        // We want daily percentage.
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            d.setHours(0, 0, 0, 0);
            dates.push(d);
        }

        const attendanceStats = [];
        for (const d of dates) {
            const att = await AttendanceModel.find({ date: d });
            let totalPresent = 0;
            let totalStudents = 0; // In records
            att.forEach(a => {
                a.records.forEach((r: any) => {
                    totalStudents++;
                    if (r.status === "Present") totalPresent++;
                });
            });
            attendanceStats.push({
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                percentage: totalStudents > 0 ? (totalPresent / totalStudents * 100).toFixed(1) : 0
            });
        }

        // 2. Class Performance (Avg % in latest exam)
        // Find latest exam for each class?
        // Let's just pick 5 recent exams.
        const recentExams = await ExamModel.find({})
            .sort({ date: -1 })
            .limit(5)
            .populate("classId", "name division");

        const examPerformance = [];
        for (const exam of recentExams) {
            const results = await ResultModel.find({ examId: exam._id });
            let totalPercentage = 0;
            let count = 0;

            results.forEach(res => {
                const totalObt = res.marks.reduce((sum: number, m: any) => sum + m.obtained, 0);
                const grandTotal = exam.subjects.reduce((sum: number, s: any) => sum + s.totalMarks, 0);
                if (grandTotal > 0) {
                    totalPercentage += (totalObt / grandTotal) * 100;
                    count++;
                }
            });

            examPerformance.push({
                examName: exam.name,
                className: `${exam.classId.name} ${exam.classId.division}`,
                avgPercentage: count > 0 ? (totalPercentage / count).toFixed(1) : 0
            });
        }

        return { attendanceStats, examPerformance };

    } catch (error) {
        console.error("Failed to fetch analytics:", error);
        return { error: "Failed to load analytics" };
    }
}
