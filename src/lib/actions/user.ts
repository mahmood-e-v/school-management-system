"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";

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
        const teachers = await User.find({ role: { $in: ["teacher", "admin"] } }).select("name email role permissions createdAt");
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
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let inserted = 0;
        const errors: any[] = [];
        const defaultPassword = await bcrypt.hash("school123", 10);

        for (const [index, row] of (jsonData as any[]).entries()) {
            const rowIndex = index + 2;

            // Normalize keys: Lowercase and remove spaces
            const normalizedRow: any = {};
            // Fuzzy match keys
            Object.keys(row).forEach(key => {
                const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                normalizedRow[norm] = row[key];
            });

            // Extract using fuzzy logic
            // Name: matches 'name', 'teachername', 'fullname'
            let NameKey = Object.keys(normalizedRow).find(k => k === 'name' || k.includes('teachername') || k.includes('fullname'));
            if (!NameKey) NameKey = Object.keys(normalizedRow).find(k => k.includes('name') && !k.includes('email'));

            // Email: matches 'email', 'mail'
            let EmailKey = Object.keys(normalizedRow).find(k => k.includes('email') || k.includes('mail'));

            let name = normalizedRow[NameKey || 'name'];
            let email = normalizedRow[EmailKey || 'email'];

            // Handle Type safety and trimming
            if (typeof name === 'string') name = name.trim();
            if (typeof email === 'string') email = email.trim().toLowerCase();

            // Skip empty rows (common in Excel)
            if (!name && !email) {
                // Just skip, don't error, as it's likely a ghost row
                continue;
            }

            if (!name || !email) {
                errors.push(`Row ${rowIndex}: Missing Name or Email (Name: ${name || 'missing'}, Email: ${email || 'missing'})`);
                continue;
            }

            try {
                // Check for existing user (case-insensitive due to lowercase above)
                // Also ensure DB check is case insensitive just in case
                const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

                if (existingUser) {
                    errors.push(`Row ${rowIndex}: Email '${email}' already exists`);
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
                errors.push(`Row ${rowIndex}: Database error`);
            }
        }

        revalidatePath("/dashboard/teachers");
        return { success: true, inserted, errors };

    } catch (error) {
        console.error("Upload error:", error);
        return { error: "Failed to process file" };
    }
}
