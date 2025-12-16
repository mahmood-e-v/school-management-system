"use server";

import dbConnect from "@/lib/db";
import ExamModel from "@/models/Exam";
import ResultModel from "@/models/Result";
import StudentModel from "@/models/Student";
import ClassModel from "@/models/Class";
import GradeModel from "@/models/Grade";

export async function getClassesWithExams() {
    try {
        await dbConnect();
        // Return classes that have exams associated with them? 
        // Or just all classes, and we filter exams later.
        const classes = await ClassModel.find({}).sort({ name: 1, division: 1 });
        return JSON.parse(JSON.stringify(classes));
    } catch (error) {
        return [];
    }
}

export async function getExamsForClass(classId: string) {
    try {
        await dbConnect();
        // find exams where classes.classId matches
        const exams = await ExamModel.find({ "classes.classId": classId }).sort({ startDate: -1 });
        return JSON.parse(JSON.stringify(exams));
    } catch (error) {
        return [];
    }
}

export async function generateClassReportSafe(examId: string, classId: string): Promise<any> {
    try {
        await dbConnect();

        // 1. Fetch Exam (Raw)
        const exam: any = await ExamModel.findById(examId).lean();
        if (!exam) return { error: "Exam not found" };

        const classConfig = exam.classes.find((c: any) => c.classId.toString() === classId);
        if (!classConfig) return { error: "Class not found in exam" };

        const subjects = classConfig.subjects;

        // 2. Fetch Students (Raw)
        const students: any[] = await StudentModel.find({ classId }).sort({ rollNo: 1 }).lean();

        // 3. Fetch Results (Raw)
        const studentIds = students.map((s: any) => s._id.toString());
        const results: any[] = await ResultModel.find({ examId, studentId: { $in: studentIds } }).lean();

        // 4. Fetch Grades (Raw)
        const grades: any[] = await GradeModel.find({}).sort({ minPercentage: -1 }).lean();

        // Helper to calculate grade
        const getGrade = (percentage: number) => {
            return grades.find((g: any) => percentage >= g.minPercentage && percentage <= g.maxPercentage) || { name: "F", gradePoint: 0 };
        };

        // 5. Construct Report Data Manually
        const reportData = students.map((student: any) => {
            const result = results.find((r: any) => r.studentId.toString() === student._id.toString());

            let totalObtained = 0;
            let maxTotal = 0;
            let isFailed = false;

            const subjectMarks = subjects.map((sub: any) => {
                const markEntry = result?.marks?.find((m: any) => m.subject === sub.name);
                const obtained = markEntry?.obtained || 0;
                const total = sub.totalMarks;

                // Check for fail conditions (e.g. < 35% or custom logic if needed)
                if ((obtained / total) * 100 < 35) {
                    isFailed = true;
                }

                totalObtained += obtained;
                maxTotal += total;

                const percentage = total > 0 ? (obtained / total) * 100 : 0;
                const grade = getGrade(percentage);

                return {
                    subject: String(sub.name),
                    obtained: Number(obtained),
                    total: Number(total),
                    percentage: percentage.toFixed(1),
                    grade: String(grade.name),
                    remarks: String(markEntry?.remarks || "")
                };
            });

            const overallPercentage = maxTotal > 0 ? (totalObtained / maxTotal) * 100 : 0;
            const overallGrade = getGrade(overallPercentage);

            // Determine result status
            // If any subject is failed, the overall result is FAILED? Or just based on total %?
            // User requirement was "Rank only passed students", implying a pass/fail distinction exists.
            // Using a simple 35% rule for now as default.
            const resultStatus = overallPercentage >= 35 && !isFailed ? "PASSED" : "FAILED";

            return {
                student: {
                    _id: student._id.toString(),
                    name: String(student.name),
                    rollNo: String(student.rollNo),
                    admissionNo: student.admissionNo ? String(student.admissionNo) : "",
                },
                results: subjectMarks,
                summary: {
                    totalObtained: Number(totalObtained),
                    maxTotal: Number(maxTotal),
                    percentage: overallPercentage.toFixed(2),
                    grade: String(overallGrade.name),
                    gradePoint: Number(overallGrade.gradePoint || 0),
                    result: resultStatus,
                    rank: 0, // Placeholder
                    classTeacherRemark: result?.classTeacherRemark ? String(result.classTeacherRemark) : "",
                    principalRemark: result?.principalRemark ? String(result.principalRemark) : ""
                }
            };
        });

        // 6. Calculate Ranks (ONLY FOR PASSED STUDENTS)
        const passedStudents = reportData.filter(d => d.summary.result === "PASSED");
        passedStudents.sort((a, b) => parseFloat(b.summary.percentage) - parseFloat(a.summary.percentage));

        passedStudents.forEach((d, index) => {
            d.summary.rank = index + 1;
        });

        // FAILED students get minimal rank (e.g. 0 or nothing)

        // 7. Re-sort by Roll No for display
        reportData.sort((a, b) => {
            const rollA = parseInt(a.student.rollNo) || 0;
            const rollB = parseInt(b.student.rollNo) || 0;
            return rollA - rollB;
        });

        // 8. Final Manual Object Construction
        const safePayload = {
            examName: String(exam.name || ""),
            academicYear: String(exam.academicYear || ""),
            date: exam.startDate ? new Date(exam.startDate).toISOString() : "",
            reportData: reportData
        };

        return safePayload;

    } catch (error) {
        console.error("Report Generation Error:", error);
        return { error: "Failed to generate report" };
    }
}
