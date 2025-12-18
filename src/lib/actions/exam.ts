"use server";

import dbConnect from "@/lib/db";
import ExamModel from "@/models/Exam";
import ClassModel from "@/models/Class";
import { revalidatePath } from "next/cache";

export async function getExams() {
    try {
        await dbConnect();
        // Populate nested classId inside classes array
        const exams = await ExamModel.find({})
            .populate("classes.classId", "name division")
            .sort({ startDate: -1 });
        return JSON.parse(JSON.stringify(exams));
    } catch (error) {
        console.error("Failed to fetch exams:", error);
        return [];
    }
}

import ResultModel from "@/models/Result";

export async function createExam(formData: FormData) {
    try {
        await dbConnect();
        const name = formData.get("name") as string;
        const academicYear = formData.get("academicYear") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;

        // Handle Grade-based assignments (expecting JSON string)
        // Format: [{ gradeName: string, subjects: [{ name: string, totalMarks: number }] }]
        const gradeAssignmentsJson = formData.get("gradeAssignments") as string;
        const gradeAssignments = JSON.parse(gradeAssignmentsJson || "[]");

        if (!name || !academicYear || !startDate || gradeAssignments.length === 0) {
            return { error: "Missing required fields" };
        }

        // Fetch all classes to map gradeNames to individual classIds
        const allClasses = await ClassModel.find({});

        const finalClasses: any[] = [];

        for (const ga of gradeAssignments) {
            const matchingClasses = allClasses.filter(c => c.name === ga.gradeName);

            if (matchingClasses.length === 0) {
                console.warn(`No classes found for grade: ${ga.gradeName}`);
                continue;
            }

            // Assign same subjects to every division in this grade
            matchingClasses.forEach(cls => {
                finalClasses.push({
                    classId: cls._id,
                    subjects: ga.subjects
                });
            });
        }

        if (finalClasses.length === 0) {
            return { error: "Could not find any matching classes for the selected grades." };
        }

        await ExamModel.create({
            name,
            academicYear,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            classes: finalClasses,
            status: "Draft"
        });

        revalidatePath("/dashboard/exams");
        return { success: true };

    } catch (error) {
        console.error("Failed to create exam:", error);
        return { error: "Failed to create exam" };
    }
}

export async function updateExam(examId: string, formData: FormData) {
    try {
        await dbConnect();
        const name = formData.get("name") as string;
        const academicYear = formData.get("academicYear") as string;
        const startDate = formData.get("startDate") as string;
        const endDate = formData.get("endDate") as string;

        const gradeAssignmentsJson = formData.get("gradeAssignments") as string;
        const gradeAssignments = JSON.parse(gradeAssignmentsJson || "[]");

        if (!name || !academicYear || !startDate || gradeAssignments.length === 0) {
            return { error: "Missing required fields" };
        }

        const allClasses = await ClassModel.find({});
        const finalClasses: any[] = [];

        for (const ga of gradeAssignments) {
            const matchingClasses = allClasses.filter(c => c.name === ga.gradeName);
            if (matchingClasses.length === 0) continue;

            matchingClasses.forEach(cls => {
                finalClasses.push({
                    classId: cls._id,
                    subjects: ga.subjects
                });
            });
        }

        if (finalClasses.length === 0) {
            return { error: "Could not find any matching classes for the selected grades." };
        }

        await ExamModel.findByIdAndUpdate(examId, {
            name,
            academicYear,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            classes: finalClasses,
        });

        revalidatePath("/dashboard/exams");
        return { success: true };

    } catch (error) {
        console.error("Failed to update exam:", error);
        return { error: "Failed to update exam" };
    }
}

export async function deleteExam(examId: string) {
    try {
        await dbConnect();

        // Check for dependencies
        const resultCount = await ResultModel.countDocuments({ examId });
        if (resultCount > 0) {
            return { error: `Cannot delete exam. ${resultCount} student results are associated with it.` };
        }

        await ExamModel.findByIdAndDelete(examId);
        revalidatePath("/dashboard/exams");
        return { success: true };
    } catch (error) {
        console.error("Delete exam error:", error);
        return { error: "Failed to delete exam" };
    }
}
