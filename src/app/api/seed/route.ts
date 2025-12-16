import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    await dbConnect();

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
        return NextResponse.json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
        name: "System Admin",
        email: "admin@school.com",
        password: hashedPassword,
        role: "admin",
    });

    return NextResponse.json({
        message: "Admin created",
        email: "admin@school.com",
        password: "admin123",
    });
}
