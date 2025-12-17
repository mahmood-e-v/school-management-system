"use server";

import dbConnect from "@/lib/db";
import SchoolModel from "@/models/School";
import { revalidatePath } from "next/cache";

export async function getSchoolSettings() {
    try {
        await dbConnect();
        // Since we only have one school, we find the first one.
        // If none exists, we return default values (or null and let UI handle defaults)
        // But since the model has defaults, we can create one if missing or just return defaults.

        const school = await SchoolModel.findOne().lean();

        if (!school) {
            // Return defaults matching the Model defaults if not found in DB
            return {
                name: "Madrasa Wadi Rahma",
                address: "Falaj Haza' Al Ain",
                logo: "https://placehold.co/80x80?text=Logo",
                email: "",
                phone: ""
            };
        }

        return JSON.parse(JSON.stringify(school));
    } catch (error) {
        console.error("Error fetching school settings:", error);
        return {
            name: "Madrasa Wadi Rahma",
            address: "Falaj Haza' Al Ain",
            logo: "https://placehold.co/80x80?text=Logo"
        };
    }
}

export async function updateSchoolSettings(data: {
    name: string;
    address: string;
    logo: string;
    email?: string;
    phone?: string;
}) {
    try {
        await dbConnect();

        // Upsert: update the first document found, or create new one
        await SchoolModel.findOneAndUpdate({}, data, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        });

        revalidatePath("/dashboard/reports");
        revalidatePath("/dashboard/settings"); // if we had a settings page
        return { success: true };
    } catch (error) {
        console.error("Error updating school settings:", error);
        return { error: "Failed to update settings" };
    }
}
