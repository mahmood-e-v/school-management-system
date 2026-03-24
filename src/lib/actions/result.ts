"use server";

import dbConnect from "@/lib/db";
import ResultModel from "@/models/Result";
import ExamModel from "@/models/Exam";
import StudentModel from "@/models/Student";
import "@/models/Class"; // Setup Class model for populate
import { revalidatePath } from "next/cache";

export async function getExamSheetFinal(examId: string, classId?: string) {
    try {
        await dbConnect();

        // 1. Fetch Exam (Raw)
        // We use lean() but we will NOT rely on it for serialization
        const exam: any = await ExamModel.findById(examId).populate("classes.classId", "name division").lean();
        if (!exam) return { error: "Exam not found" };

        // 2. Initial Manual Reconstruction of Exam Object
        // We act like a paranoid sanitizer, trusting nothing coming from the DB.
        const safeExam = {
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
        // safeExam is now a pure JS object, so no serialization issues here
        const classConfig = safeExam.classes.find((c: any) => c.classId._id === classId);
        if (!classConfig) return { error: "Class not found in this exam" };

        const subjects = classConfig.subjects;

        // 3. Fetch Students (Raw)
        const studentsRaw: any[] = await StudentModel.find({ classId }).sort({ rollNo: 1 }).lean();

        // 4. Fetch Existing Results (Raw)
        const studentIds = studentsRaw.map((s: any) => s._id.toString());
        const resultsRaw: any[] = await ResultModel.find({ examId, studentId: { $in: studentIds } }).lean();

        // 5. Construct Sheet Manually
        const sheet = studentsRaw.map((student: any) => {
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
        // @ts-ignore
        safeExam.currentSubjects = subjects;
        // @ts-ignore
        safeExam.currentClassId = classConfig.classId;

        // 6. Return Clean Object
        // No need for JSON.parse/stringify because we built it from primitives
        return { exam: safeExam, sheet };

    } catch (error) {
        console.error("Failed to fetch exam sheet:", error);
        return { error: "Failed to load data" };
    }
}

export async function saveExamMarks(examId: string, classId: string, formData: FormData) {
    try {
        await dbConnect();
        const exam = await ExamModel.findById(examId);
        if (!exam) return { error: "Exam not found" };

        // Find subjects for this class
        const classConfig = exam.classes.find((c: any) => c.classId.toString() === classId);
        if (!classConfig) return { error: "Class config not found" };
        const subjects = classConfig.subjects;

        const studentDataStr = formData.get("studentIds") as string;
        if (!studentDataStr) return { error: "No student data" };
        const studentIds = JSON.parse(studentDataStr);

        const bulkOps: any[] = [];

        for (const studentId of studentIds) {
            const studentMarks = [];
            for (const subject of subjects) {
                const val = formData.get(`marks-${studentId}-${subject.name}`);
                const subRemark = formData.get(`remark-${studentId}-${subject.name}`);

                if (val !== null && val !== "") {
                    let numVal = Number(val);
                    if (isNaN(numVal)) {
                        console.warn(`Invalid mark value for student ${studentId} subject ${subject.name}: ${val}`);
                        // Optionally default to 0 or skip. Let's skip invalid marks but log it.
                        // Or better, set to 0 to avoid losing the entry entirely? 
                        // User likely wants it to work. If it's Excel upload error, maybe 0 is safer than crashing.
                        numVal = 0;
                    }

                    studentMarks.push({
                        subject: subject.name,
                        obtained: numVal,
                        total: subject.totalMarks,
                        remarks: String(subRemark || "")
                    });
                }
            }

            const classTeacherRemark = formData.get(`classRemark-${studentId}`) as string;

            if (studentMarks.length > 0 || classTeacherRemark) {
                bulkOps.push({
                    updateOne: {
                        filter: { examId, studentId },
                        update: {
                            $set: {
                                marks: studentMarks,
                                classTeacherRemark
                            }
                        },
                        upsert: true
                    }
                });
            }
        }

        if (bulkOps.length > 0) {
            const bulkResult = await ResultModel.bulkWrite(bulkOps);
            console.log(`Bulk save: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} modified.`);
        }

        revalidatePath(`/dashboard/exams/${examId}/marks`);
        return { success: true };

    } catch (error: any) {
        console.error("Failed to save marks:", error);
        return { error: `Failed to save marks: ${error.message || "Unknown error"}` };
    }
}
