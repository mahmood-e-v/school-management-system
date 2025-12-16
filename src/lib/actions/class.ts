"use server";

import * as XLSX from "xlsx";
import dbConnect from "@/lib/db";
import ClassModel from "@/models/Class";
import { revalidatePath } from "next/cache";

export async function uploadClasses(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { error: "No file provided" };
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        await dbConnect();

        let inserted = 0;
        let updated = 0;
        const errors = [];

        console.log("Processing", data.length, "classes from Excel");
        if (data.length > 0) {
            console.log("Excel Headers (First Row Keys):", Object.keys(data[0] as object));
        }

        for (const [index, row] of data.entries()) {
            const rowIndex = index + 2;
            const rowData = row as any;
            // Handle header variations
            const Name = rowData.Name || rowData.Class;
            const Division = rowData.Division;
            const Teacher = rowData.Teacher || rowData.ClassTeacher;

            if (!Name || !Division) {
                errors.push(`Row ${rowIndex}: Missing Class Name or Division`);
                continue;
            }

            // Cleanup inputs
            const cleanName = String(Name).trim();
            const cleanDivision = String(Division).trim();
            const cleanTeacher = Teacher ? String(Teacher).trim() : "Not Assigned";

            console.log(`Row ${rowIndex}: Checking ${cleanName}-${cleanDivision}. Teacher in Excel: '${Teacher}' -> Clean: '${cleanTeacher}'`);

            // Check existence
            const existing = await ClassModel.findOne({ name: cleanName, division: cleanDivision });
            if (existing) {
                console.log(`Found existing class: ${existing.name}-${existing.division}. Current Teacher: '${existing.classTeacher}'`);

                // Update teacher if provided and different
                // We check if cleanTeacher is meaningful (not "Not Assigned" unless we want to clear it? assume we only want to set it)
                // If Excel has empty teacher, cleanTeacher is "Not Assigned". We probably don't want to overwrite an existing name with "Not Assigned" if the excel is blank.
                // But if the user deliberately wants to clear it? Let's assume blank in Excel means "don't change" or "no teacher". 
                // Let's strictly update if cleanTeacher is NOT "Not Assigned".

                if (cleanTeacher !== "Not Assigned" && existing.classTeacher !== cleanTeacher) {
                    console.log(`Updating teacher to: ${cleanTeacher}`);
                    existing.classTeacher = cleanTeacher;
                    await existing.save();
                    updated++;
                } else {
                    console.log("Skipping update. Either teacher matches or excel is blank.");
                    errors.push(`Row ${rowIndex}: Class ${cleanName}-${cleanDivision} already exists (No changes made)`);
                }
                continue;
            }

            console.log(`Creating new class with teacher: ${cleanTeacher}`);
            await ClassModel.create({
                name: cleanName,
                division: cleanDivision,
                classTeacher: cleanTeacher
            });
            inserted++;
        }

        revalidatePath("/dashboard/classes");
        return {
            success: true,
            inserted,
            updated,
            errors
        };

    } catch (error) {
        console.error("Failed to upload classes:", error);
        return { error: "Failed to process file" };
    }
}

export async function createClass(formData: FormData) {
    try {
        await dbConnect();
        const name = formData.get("name") as string;
        const division = formData.get("division") as string;
        const classTeacher = formData.get("classTeacher") as string;

        if (!name || !division) {
            return { error: "Name and Division are required" };
        }

        const existingClass = await ClassModel.findOne({ name, division });
        if (existingClass) {
            return { error: "Class already exists" };
        }

        await ClassModel.create({
            name,
            division,
            classTeacher: classTeacher || "Not Assigned",
        });
        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (error) {
        console.error("Failed to create class:", error);
        return { error: "Failed to create class" };
    }
}

export async function editClass(formData: FormData) {
    try {
        await dbConnect();
        const id = formData.get("id") as string;
        // const name = formData.get("name") as string; // Typically we don't edit name/division because it breaks relations
        const classTeacher = formData.get("classTeacher") as string;

        if (!id) return { error: "Class ID required" };

        await ClassModel.findByIdAndUpdate(id, {
            classTeacher: classTeacher || "Not Assigned"
        });

        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (error) {
        console.error("Failed to edit class:", error);
        return { error: "Failed to update class" };
    }
}

export async function deleteClass(id: string) {
    try {
        await dbConnect();
        // Check if class has students?
        const studentCount = await StudentModel.countDocuments({ classId: id });
        if (studentCount > 0) {
            return { error: `Cannot delete class with ${studentCount} students. Transfer or delete students first.` };
        }
        await ClassModel.findByIdAndDelete(id);
        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete class:", error);
        return { error: "Failed to delete class" };
    }
}

import StudentModel from "@/models/Student";

export async function getClasses() {
    try {
        await dbConnect();
        const classes = await ClassModel.find({}).sort({ name: 1, division: 1 }).lean();

        // Get student counts for all classes
        const studentCounts = await StudentModel.aggregate([
            { $group: { _id: "$classId", count: { $sum: 1 } } }
        ]);

        // Map count to class
        const data = classes.map((cls: any) => {
            const countObj = studentCounts.find((c) => c._id.toString() === cls._id.toString());
            return {
                ...cls,
                _id: cls._id.toString(),
                studentCount: countObj ? countObj.count : 0
            };
        });

        return data;
    } catch (error) {
        console.error("Failed to fetch classes:", error);
        return [];
    }
}
