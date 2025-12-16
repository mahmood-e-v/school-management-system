"use server";

import dbConnect from "@/lib/db";
import ResultModel from "@/models/Result";
import ExamModel from "@/models/Exam";
import StudentModel from "@/models/Student";
import { revalidatePath } from "next/cache";

// Type Definitions for Manual Reconstruction
interface SafeClassRef {
    _id: string;
    name: string;
    division: string;
}

interface SafeSubject {
    _id: string;
    name: string;
    totalMarks: number;
}

interface SafeClassConfig {
    classId: SafeClassRef | null;
    subjects: SafeSubject[];
}

interface SafeExam {
    _id: string;
    name: string;
    startDate: string;
    status: string;
    endDate?: string;
    academicYear: string;
    classes: SafeClassConfig[];
    currentSubjects?: SafeSubject[];
    currentClassId?: SafeClassRef;
}

interface SafeSheetEntry {
    studentId: string;
    name: string;
    rollNo: string;
    admissionNo: string;
    marks: Record<string, { obtained: number; remarks: string }>;
    classTeacherRemark: string;
    principalRemark: string;
}

interface GetExamSheetResult {
    exam?: SafeExam;
    sheet?: SafeSheetEntry[];
    error?: string;
    requiresClassSelection?: boolean;
    availableClasses?: SafeClassConfig[];
}

export async function getExamSheetDebug(examId: string, classId?: string): Promise<GetExamSheetResult> {
    try {
        await dbConnect();

        // 1. Fetch Exam (Raw)
        const exam: any = await ExamModel.findById(examId).populate("classes.classId", "name division").lean();
        if (!exam) return { error: "Exam not found" };

        // 2. Initial Manual Reconstruction of Exam Object
        const safeExam: SafeExam = {
            _id: exam._id.toString(),
            name: String(exam.name || ""),
            startDate: exam.startDate ? new Date(exam.startDate).toISOString() : new Date().toISOString(),
            status: String(exam.status || "draft"),
            endDate: exam.endDate ? new Date(exam.endDate).toISOString() : undefined,
            academicYear: String(exam.academicYear || ""),
            classes: Array.isArray(exam.classes) ? exam.classes.map((c: any) => ({
                classId: c.classId ? {
                    _id: c.classId._id ? c.classId._id.toString() : String(c.classId),
                    name: String(c.classId.name || ""),
                    division: String(c.classId.division || "")
                } : null,
                subjects: Array.isArray(c.subjects) ? c.subjects.map((s: any) => ({
                    _id: s._id ? s._id.toString() : new Date().getTime().toString(),
                    name: String(s.name),
                    totalMarks: Number(s.totalMarks)
                })) : []
            })) : []
        };

        // If no classId provided and multiple classes exist, return list for selection
        if (!classId) {
            if (safeExam.classes.length > 1) {
                return {
                    exam: safeExam,
                    requiresClassSelection: true,
                    availableClasses: safeExam.classes
                };
            } else if (safeExam.classes.length === 1) {
                // @ts-ignore
                classId = safeExam.classes[0].classId._id;
            } else {
                return { error: "No classes assigned to this exam" };
            }
        }

        // Find the specific class config in the exam
        const classConfig = safeExam.classes.find((c: any) => c.classId._id === classId);
        if (!classConfig) return { error: "Class not found in this exam" };
        if (!classConfig.classId) return { error: "Invalid class config" };

        const subjects = classConfig.subjects;

        // 3. Fetch Students (Raw)
        const studentsRaw: any[] = await StudentModel.find({ classId }).sort({ rollNo: 1 }).lean();

        // 4. Fetch Existing Results (Raw)
        const studentIds = studentsRaw.map((s: any) => s._id.toString());
        const resultsRaw: any[] = await ResultModel.find({ examId, studentId: { $in: studentIds } }).lean();

        // 5. Construct Sheet Manually
        const sheet: SafeSheetEntry[] = studentsRaw.map((student: any) => {
            const existingResult = resultsRaw.find(
                (r: any) => r.studentId.toString() === student._id.toString()
            );

            // Map marks manually
            const marksMap: Record<string, any> = {};
            if (existingResult && Array.isArray(existingResult.marks)) {
                existingResult.marks.forEach((m: any) => {
                    marksMap[m.subject] = {
                        obtained: Number(m.obtained),
                        remarks: String(m.remarks || "")
                    };
                });
            }

            return {
                studentId: student._id.toString(),
                name: String(student.name),
                rollNo: String(student.rollNo),
                admissionNo: student.admissionNo ? String(student.admissionNo) : "",
                marks: marksMap,
                classTeacherRemark: existingResult?.classTeacherRemark ? String(existingResult.classTeacherRemark) : "",
                principalRemark: existingResult?.principalRemark ? String(existingResult.principalRemark) : ""
            };
        });

        // Add subjects to the returned exam object
        safeExam.currentSubjects = subjects;
        safeExam.currentClassId = classConfig.classId;

        // 6. Return Clean Object
        return { exam: safeExam, sheet };

    } catch (error) {
        console.error("Failed to fetch exam sheet:", error);
        return { error: "Failed to load data" };
    }
}
