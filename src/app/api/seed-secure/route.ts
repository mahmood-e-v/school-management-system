import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    await dbConnect();

    // Create a new secure admin
    const email = "superadmin@school.com";
    const rawPassword = "SecurePass!2024" + Math.random().toString(36).slice(-4);

    // Check if exists
    const existing = await User.findOne({ email });
    if (existing) {
        // Update password if exists
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        existing.password = hashedPassword;
        await existing.save();
        return NextResponse.json({
            message: "Admin password updated",
            email,
            password: rawPassword
        });
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await User.create({
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: "admin",
    });

    return NextResponse.json({
        message: "Secure Admin created",
        email,
        password: rawPassword,
    });
}
