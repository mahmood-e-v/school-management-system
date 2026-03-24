const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/school-management-system"; // Ensure it connects to local dev DB or get DB from .env

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;

        // 0. Update existing Classes
        const classResult = await db.collection("classes").updateMany(
            { $or: [{ academicYear: { $exists: false } }, { academicYear: "" }] },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Updated ${classResult.modifiedCount} classes to 2025-26`);

        // Force all classes just to be absolutely sure
        const allClassResult = await db.collection("classes").updateMany(
            {},
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Forced ${allClassResult.modifiedCount} classes to 2025-26`);

        // 1. Update existing Exams
        const examResult = await db.collection("exams").updateMany(
            { $or: [{ academicYear: { $exists: false } }, { academicYear: "" }] },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Updated ${examResult.modifiedCount} exams to 2025-26`);

        // Force all exams to 2025-26 just to be absolutely sure because user requested it
        const allExamResult = await db.collection("exams").updateMany(
            {},
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Forced ${allExamResult.modifiedCount} exams to 2025-26`);

        // 2. Update existing Attendance
        const attendanceResult = await db.collection("attendances").updateMany(
            { $or: [{ academicYear: { $exists: false } }, { academicYear: "" }] },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Updated ${attendanceResult.modifiedCount} attendance records to 2025-26`);
        
        // Force all attendance to 2025-26
        const allAttResult = await db.collection("attendances").updateMany(
            {},
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Forced ${allAttResult.modifiedCount} attendance records to 2025-26`);

        // 3. Ensure SchoolSettings has a default currentAcademicYear
        const settingsResult = await db.collection("schools").updateMany(
            {},
            { $set: { currentAcademicYear: "2025-26" } }
        );
        console.log(`Updated ${settingsResult.modifiedCount} school settings to 2025-26`);

        // If no school settings exist, create a default one
        const schoolsCount = await db.collection("schools").countDocuments();
        if (schoolsCount === 0) {
            await db.collection("schools").insertOne({
                name: "Madrasa Wadi Rahma",
                address: "Falaj Haza' Al Ain",
                logo: "https://placehold.co/80x80?text=Logo",
                currentAcademicYear: "2025-26",
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Created default school settings with academic year 2025-26.");
        }

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
