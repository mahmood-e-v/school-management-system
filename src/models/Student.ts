import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        rollNo: {
            type: String, // Can be alphanumeric
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        parentName: { type: String },
        parentPhone: { type: String },
        location: { type: String },
        transportMode: { type: String, default: "Bus" }, // Bus, Car, etc.
        busNumber: { type: String },
        studentEmail: { type: String },
        parentEmail: { type: String },
        parentCustomId: { type: String }, // Manual ID entry from Excel
        details: {
            // Flexible field for other details
            contact: String,
            address: String,
        },
    },
    { timestamps: true }
);

// Ensure unique roll number within a class
StudentSchema.index({ classId: 1, rollNo: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
