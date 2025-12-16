"use server";

import dbConnect from "@/lib/db";
import GradeModel from "@/models/Grade";
import RemarkModel from "@/models/Remark";
import { revalidatePath } from "next/cache";

// --- GRADES ---

export async function getGrades() {
    try {
        await dbConnect();
        const grades = await GradeModel.find({}).sort({ minPercentage: -1 });
        return JSON.parse(JSON.stringify(grades));
    } catch (error) {
        console.error("Get grades error:", error);
        return [];
    }
}

export async function addGrade(formData: FormData) {
    try {
        await dbConnect();
        const name = formData.get("name");
        const min = Number(formData.get("minPercentage"));
        const max = Number(formData.get("maxPercentage"));
        const desc = formData.get("description");

        if (!name || isNaN(min) || isNaN(max)) return { error: "Invalid data" };

        await GradeModel.create({ name, minPercentage: min, maxPercentage: max, description: desc });
        revalidatePath("/dashboard/exams/settings");
        return { success: true };
    } catch (error) {
        return { error: "Failed to add grade" };
    }
}

export async function deleteGrade(id: string) {
    try {
        await dbConnect();
        await GradeModel.findByIdAndDelete(id);
        revalidatePath("/dashboard/exams/settings");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete grade" };
    }
}

// --- REMARKS ---

export async function getRemarksSafe() {
    try {
        await dbConnect();
        const remarks: any[] = await RemarkModel.find({}).sort({ createdAt: -1 }).lean();
        return remarks.map((r: any) => ({
            _id: r._id.toString(),
            text: String(r.text),
            type: String(r.type || "General"),
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : ""
        }));
    } catch (error) {
        console.error("Get remarks error:", error);
        return [];
    }
}

export async function addRemark(formData: FormData) {
    try {
        await dbConnect();
        const text = formData.get("text");
        const type = formData.get("type");

        if (!text) return { error: "Text required" };

        await RemarkModel.create({ text, type });
        revalidatePath("/dashboard/exams/settings");
        return { success: true };
    } catch (error) {
        return { error: "Failed to add remark" };
    }
}

export async function deleteRemark(id: string) {
    try {
        await dbConnect();
        await RemarkModel.findByIdAndDelete(id);
        revalidatePath("/dashboard/exams/settings");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete remark" };
    }
}
