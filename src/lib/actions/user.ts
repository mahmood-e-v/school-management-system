"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
    try {
        await dbConnect();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as string || "teacher";
        const permissions = formData.getAll("permissions") as string[];

        if (!name || !email || !password) {
            return { error: "Name, Email, and Password are required" };
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "User with this email already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            permissions,
        });

        revalidatePath("/dashboard/teachers");
        return { success: true };
    } catch (error) {
        console.error("Failed to create user:", error);
        return { error: "Failed to create user" };
    }
}

export async function getTeachers() {
    try {
        await dbConnect();
        const teachers = await User.find({ role: "teacher" }).select("name email role permissions createdAt");
        return JSON.parse(JSON.stringify(teachers));
    } catch (error) {
        console.error("Failed to fetch teachers:", error);
        return [];
    }
}

export async function updateUser(formData: FormData) {
    try {
        await dbConnect();
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const permissions = formData.getAll("permissions") as string[];

        if (!id || !name || !email || !role) {
            return { error: "Missing required fields" };
        }

        const password = formData.get("password") as string;

        const updateData: any = {
            name,
            email,
            role,
            permissions,
        };

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await User.findByIdAndUpdate(id, updateData);

        revalidatePath("/dashboard/teachers");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { error: "Failed to update user" };
    }
}

export async function uploadTeachers(formData: FormData) {
    try {
        await dbConnect();
        const file = formData.get("file") as File;

        if (!file) {
            return { error: "No file uploaded" };
        }

        const buffer = await file.arrayBuffer();
        const workbook = (await import("xlsx")).read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = (await import("xlsx")).utils.sheet_to_json(worksheet);

        let inserted = 0;
        const errors: any[] = [];
        const defaultPassword = await bcrypt.hash("school123", 10);

        for (const row of jsonData as any[]) {
            const name = row.Name || row.name;
            const email = row.Email || row.email;

            if (!name || !email) {
                errors.push({ row, error: "Missing Name or Email" });
                continue;
            }

            try {
                // Check for existing user
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    errors.push({ row, error: "Email already exists" });
                    continue;
                }

                await User.create({
                    name,
                    email,
                    password: defaultPassword,
                    role: "teacher",
                });
                inserted++;
            } catch (error) {
                console.error("Row error:", error);
                errors.push({ row, error: "Database error" });
            }
        }

        revalidatePath("/dashboard/teachers");
        return { success: true, inserted, errors };

    } catch (error) {
        console.error("Upload error:", error);
        return { error: "Failed to process file" };
    }
}
