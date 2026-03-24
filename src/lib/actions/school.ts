"use server";

import dbConnect from "@/lib/db";
import SchoolModel from "@/models/School";
import AttendanceModel from "@/models/Attendance";
import ExamModel from "@/models/Exam";
import ClassModel from "@/models/Class";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getSchoolSettings() {
    try {
        await dbConnect();
        // Since we only have one school, we find the first one.
        // If none exists, we return default values (or null and let UI handle defaults)
        // But since the model has defaults, we can create one if missing or just return defaults.
        await dbConnect();
        // Use raw collection to bypass Mongoose schema caching for newly added fields
        const school = await SchoolModel.collection.findOne({}, { sort: { createdAt: -1 } });

        if (!school) {
            // Return defaults matching the Model defaults if not found in DB
            return {
                name: "Madrasa Wadi Rahma",
                address: "Falaj Haza' Al Ain",
                logo: "https://placehold.co/80x80?text=Logo",
                email: "",
                phone: "",
                currentAcademicYear: "2025-26",
                academicYearStartDate: null,
                academicYearEndDate: null,
                classTeacherSignature: "",
                sadarMuallimSignature: "",
                sadarMuallimName: "",
                classTeacherSignatures: []
            };
        }

        const settings = JSON.parse(JSON.stringify(school));
        // console.log("Fetched Settings:", { name: settings.name, hasSadarName: !!settings.sadarMuallimName });
        return settings;
    } catch (error) {
        console.error("Error fetching school settings:", error);
        return {
            name: "Madrasa Wadi Rahma",
            address: "Falaj Haza' Al Ain",
            logo: "https://placehold.co/80x80?text=Logo",
            currentAcademicYear: "2025-26",
            academicYearStartDate: null,
            academicYearEndDate: null,
            classTeacherSignature: "",
            sadarMuallimSignature: "",
            sadarMuallimName: "",
            classTeacherSignatures: []
        };
    }
}

export async function updateSchoolSettings(data: {
    name: string;
    address: string;
    logo: string;
    email?: string;
    phone?: string;
    currentAcademicYear: string;
    academicYearStartDate?: string | Date | null;
    academicYearEndDate?: string | Date | null;
    classTeacherSignature?: string;
    sadarMuallimSignature?: string;
    sadarMuallimName?: string;
    classTeacherSignatures?: { teacherName: string; signature: string }[];
}) {
    try {
        await dbConnect();

        // Separate and sanitize the update data explicitly to ensure nothing is missed
        const updateData = {
            name: data.name,
            address: data.address,
            logo: data.logo,
            email: data.email,
            phone: data.phone,
            currentAcademicYear: data.currentAcademicYear,
            academicYearStartDate: data.academicYearStartDate || null,
            academicYearEndDate: data.academicYearEndDate || null,
            classTeacherSignature: data.classTeacherSignature,
            sadarMuallimSignature: data.sadarMuallimSignature,
            sadarMuallimName: data.sadarMuallimName,
            classTeacherSignatures: data.classTeacherSignatures || []
        };

        // Use raw collection to bypass Mongoose schema caching for newly added fields
        // returnDocument: 'after' ensures we get the updated document back
        const result = await SchoolModel.collection.findOneAndUpdate(
            {}, 
            { $set: updateData }, 
            {
                upsert: true,
                returnDocument: 'after',
                sort: { createdAt: -1 }
            }
        );

        // Cleanup: ensure only one school settings document exists
        if (result) {
            await SchoolModel.collection.deleteMany({ _id: { $ne: result._id } });
        }

        console.log("School settings updated via collection. Success:", !!result, "Sadar Name:", result?.sadarMuallimName);
        
        revalidatePath("/dashboard/reports");
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating school settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

export async function getActiveAcademicYear(): Promise<string> {
    const cookieStore = await cookies();
    const selectedYear = cookieStore.get("selectedAcademicYear")?.value;
    
    let rawYear = selectedYear;
    if (!rawYear) {
        const settings = await getSchoolSettings();
        rawYear = settings?.currentAcademicYear || "2025-26";
    }
    return String(rawYear).replace(/\s+/g, '').replace(/-20(\d{2})$/, '-$1');
}

export async function setSelectedAcademicYear(year: string) {
    const cookieStore = await cookies();
    const cleanYear = year.replace(/\s+/g, '').replace(/-20(\d{2})$/, '-$1');
    cookieStore.set("selectedAcademicYear", cleanYear, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return { success: true };
}

export async function getAvailableAcademicYears(): Promise<string[]> {
    try {
        await dbConnect();
        const settings = await getSchoolSettings();
        const active = settings?.currentAcademicYear || "2025-26";
        
        const attYears = await AttendanceModel.distinct("academicYear");
        const examYears = await ExamModel.distinct("academicYear");
        
        const rawYears = [...attYears, ...examYears, active];
        const normalizedYears = rawYears.filter(Boolean).map(y => {
            return String(y).replace(/\s+/g, '').replace(/-20(\d{2})$/, '-$1');
        });
        
        const years = new Set<string>(normalizedYears);
        
        const activeClean = String(active).replace(/\s+/g, '').replace(/-20(\d{2})$/, '-$1');
        const activeStart = parseInt(activeClean.split("-")[0]);
        if (!isNaN(activeStart)) {
            years.add(`${activeStart-1}-${((activeStart)%100).toString().padStart(2, '0')}`);
            years.add(`${activeStart+1}-${((activeStart+2)%100).toString().padStart(2, '0')}`);
        }
        
        return Array.from(years).sort().reverse();
    } catch (e) {
        console.error("Error fetching available years:", e);
        return ["2025-26", "2024-25"];
    }
}

export async function getDistinctClassTeachers(): Promise<string[]> {
    try {
        await dbConnect();
        const teachers = await ClassModel.distinct("classTeacher");
        return teachers.filter(Boolean).sort();
    } catch (e) {
        console.error("Error fetching class teachers:", e);
        return [];
    }
}

export async function getClassesForSignatures(): Promise<any[]> {
    try {
        await dbConnect();
        const settings = await getSchoolSettings();
        const activeYear = settings?.currentAcademicYear || "2025-26";
        const classes = await ClassModel.find({ academicYear: activeYear }).sort({ name: 1, division: 1 }).select('_id name division classTeacher').lean();
        return JSON.parse(JSON.stringify(classes));
    } catch (e) {
        console.error("Error fetching classes:", e);
        return [];
    }
}

