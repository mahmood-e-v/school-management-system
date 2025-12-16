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

        // Handle Class IDs (expecting JSON string or multiple values, let's use JSON string for simplicity from client)
        const classIdsJson = formData.get("classIds") as string;
        const classIds = JSON.parse(classIdsJson || "[]");

        // Handle Subjects (expecting JSON string)
        const subjectsJson = formData.get("subjects") as string;
        const subjects = JSON.parse(subjectsJson || "[]");

        if (!name || !academicYear || !startDate || classIds.length === 0 || subjects.length === 0) {
            return { error: "Missing required fields" };
        }

        // Map common subjects to each selected class
        const classes = classIds.map((id: string) => ({
            classId: id,
            subjects: subjects // Apply same subjects to all selected classes
        }));

        await ExamModel.create({
            name,
            academicYear,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            classes,
            status: "Draft" // Default to Draft
        });

        revalidatePath("/dashboard/exams");
        return { success: true };

    } catch (error) {
        console.error("Failed to create exam:", error);
        return { error: "Failed to create exam" };
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
