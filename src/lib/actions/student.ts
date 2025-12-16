"use server";

import dbConnect from "@/lib/db";
import StudentModel from "@/models/Student";
import ClassModel from "@/models/Class";
import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";

export async function getStudents(classId?: string) {
    try {
        await dbConnect();
        const query = classId ? { classId } : {};
        const students = await StudentModel.find(query)
            .populate("classId", "name division")
            .sort({ "classId.name": 1, rollNo: 1 });
        return JSON.parse(JSON.stringify(students));
    } catch (error) {
        console.error("Failed to fetch students:", error);
        return [];
    }
}

export async function uploadStudents(formData: FormData) {
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

        // Cache classes for quick lookup: Key = "Name-Division" (e.g., "Grade 10-A")
        const classes = await ClassModel.find({});
        const classMap = new Map();
        console.log("Found classes in DB:", classes.length);
        classes.forEach((bucket) => {
            const key = `${bucket.name}-${bucket.division}`.toUpperCase();
            console.log("DB Class Key:", key);
            classMap.set(key, bucket._id);
        });

        const studentsToInsert = [];
        const errors = [];

        console.log("Processing", data.length, "rows from Excel");

        const skipped = [];

        for (const [index, row] of data.entries()) {
            const rowIndex = index + 2; // Excel row number (1-based, +header)

            // Normalize keys: Lowercase and remove spaces
            const normalizedRow: any = {};
            Object.keys(row as object).forEach(key => {
                const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                normalizedRow[normalizedKey] = (row as any)[key];
            });

            // Extract using normalized keys
            const Name = normalizedRow['name'];
            const RollNo = normalizedRow['rollno'];
            const Class = normalizedRow['class'];
            const Division = normalizedRow['division'];

            // New fields mapping
            const ParentName = normalizedRow['parentname'];
            const Phone = normalizedRow['phone'] || normalizedRow['phonenumber'] || normalizedRow['parentphone'];
            const ParentID = normalizedRow['parentid'] || normalizedRow['parentcustomid'];
            const Location = normalizedRow['location'];
            const Transport = normalizedRow['transport'] || normalizedRow['transportmode'] || normalizedRow['buscar'];
            const BusNumber = normalizedRow['busnumber'];
            const StudentEmail = normalizedRow['studentemail'];
            const ParentEmail = normalizedRow['parentemail'];

            if (!Name || !RollNo || !Class || !Division) {
                errors.push(`Row ${rowIndex}: Missing required fields (Name, RollNo, Class, Division)`);
                continue;
            }

            const classKey = `${Class}-${Division}`.toUpperCase();
            const classId = classMap.get(classKey);

            if (!classId) {
                console.log(`Failed to match class: ${classKey}. Available:`, Array.from(classMap.keys()));
                errors.push(`Row ${rowIndex}: Class '${Class} ${Division}' not found (Expected format: 'Grade 10 A')`);
                continue;
            }

            const existingStudent = await StudentModel.findOne({ classId, rollNo: RollNo });

            if (existingStudent) {
                // Skip existing
                skipped.push(`${Name} (Roll ${RollNo})`);
                continue;
            }

            studentsToInsert.push({
                name: Name,
                rollNo: RollNo,
                classId,
                parentName: ParentName,
                parentPhone: Phone,
                parentCustomId: ParentID,
                location: Location,
                transportMode: Transport,
                busNumber: BusNumber,
                studentEmail: StudentEmail,
                parentEmail: ParentEmail,
            });
        }

        if (studentsToInsert.length > 0) {
            await StudentModel.insertMany(studentsToInsert);
        }

        revalidatePath("/dashboard/students");

        return {
            success: true,
            inserted: studentsToInsert.length,
            skipped: skipped,
            errors,
        };

    } catch (error) {
        console.error("Failed to upload students:", error);
        return { error: "Failed to process file" };
    }
}

export async function addStudent(formData: FormData) {
    try {
        await dbConnect();
        const name = formData.get("name") as string;
        const rollNo = formData.get("rollNo") as string;
        const classId = formData.get("classId") as string;

        if (!name || !rollNo || !classId) return { error: "Required fields missing" };

        const existing = await StudentModel.findOne({ classId, rollNo });
        if (existing) return { error: "Roll No already exists in this class" };

        const ignoreWarning = formData.get("ignoreWarning") === "true";
        if (!ignoreWarning) {
            // Check for Name OR Parent Name collision in same class may be useful, but let's stick to Name as primary warning.
            const existingName = await StudentModel.findOne({
                classId,
                name: { $regex: new RegExp(`^${name}$`, 'i') } // Case insensitive check
            });

            if (existingName) {
                // If the name exists, we return a WARNING.
                return {
                    warning: `Warning: Student "${existingName.name}" (Roll No: ${existingName.rollNo}) is already in this class.`,
                    isWarning: true
                };
            }
        }

        await StudentModel.create({
            name,
            rollNo,
            classId,
            parentName: formData.get("parentName"),
            parentPhone: formData.get("parentPhone"),
            parentCustomId: formData.get("parentCustomId"),
            location: formData.get("location"),
            transportMode: formData.get("transportMode"),
            busNumber: formData.get("busNumber"),
            studentEmail: formData.get("studentEmail"),
            parentEmail: formData.get("parentEmail"),
        });

        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (error) {
        console.error("Add student error:", error);
        return { error: "Failed to add student" };
    }
}

export async function updateStudent(formData: FormData) {
    try {
        await dbConnect();
        const id = formData.get("id") as string;
        if (!id) return { error: "ID required" };

        const updateData: any = {
            name: formData.get("name"),
            rollNo: formData.get("rollNo"),
            parentName: formData.get("parentName"),
            parentPhone: formData.get("parentPhone"),
            parentCustomId: formData.get("parentCustomId"),
            location: formData.get("location"),
            transportMode: formData.get("transportMode"),
            busNumber: formData.get("busNumber"),
            studentEmail: formData.get("studentEmail"),
            parentEmail: formData.get("parentEmail"),
        };

        // Remove undefined/empty strings if needed? Or just overwrite.
        // Mongoose handles partial updates fine.

        await StudentModel.findByIdAndUpdate(id, updateData);
        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (error) {
        console.error("Update student error:", error);
        return { error: "Failed to update student" };
    }
}

export async function deleteStudent(id: string) {
    try {
        await dbConnect();
        await StudentModel.findByIdAndDelete(id);
        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (error) {
        console.error("Delete student error:", error);
        return { error: "Failed to delete student" };
    }
}
