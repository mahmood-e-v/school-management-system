const mongoose = require("mongoose");
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please provide your MongoDB URI as an argument.");
    console.error("Usage: node scripts/migrate-academic-year.js \"YOUR_VERCEL_MONGODB_URI\"");
    process.exit(1);
}

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully.");

        const db = mongoose.connection.db;

        // 1. Give un-labelled or empty classes the default '2025-26'
        const classMissing = await db.collection("classes").updateMany(
            { $or: [{ academicYear: { $exists: false } }, { academicYear: "" }] },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Assigned '2025-26' to ${classMissing.modifiedCount} Classes that had NO year.`);

        // 2. Fix the "2025-2026" typos on classes
        const classTypo = await db.collection("classes").updateMany(
            { academicYear: "2025-2026" },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Re-assigned ${classTypo.modifiedCount} Classes from '2025-2026' to '2025-26'.`);

        // 3. Exams
        const examMissing = await db.collection("exams").updateMany(
            { $or: [{ academicYear: { $exists: false } }, { academicYear: "" }] },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Assigned '2025-26' to ${examMissing.modifiedCount} Exams that had NO year.`);

        const examTypo = await db.collection("exams").updateMany(
            { academicYear: "2025-2026" },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Re-assigned ${examTypo.modifiedCount} Exams from '2025-2026' to '2025-26'.`);

        // 4. Attendance
        const attMissing = await db.collection("attendances").updateMany(
            { $or: [{ academicYear: { $exists: false } }, { academicYear: "" }] },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Assigned '2025-26' to ${attMissing.modifiedCount} Attendance records that had NO year.`);

        const attTypo = await db.collection("attendances").updateMany(
            { academicYear: "2025-2026" },
            { $set: { academicYear: "2025-26" } }
        );
        console.log(`Re-assigned ${attTypo.modifiedCount} Attendance records from '2025-2026' to '2025-26'.`);

        // 5. School Settings validation
        const settingsTypo = await db.collection("schools").updateMany(
            { currentAcademicYear: "2025-2026" },
            { $set: { currentAcademicYear: "2025-26" } }
        );
        console.log(`Fixed ${settingsTypo.modifiedCount} School settings that were set to '2025-2026'.`);

        console.log("\nMigration completed successfully! Your data is safe and now fully linked to 2025-26.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
