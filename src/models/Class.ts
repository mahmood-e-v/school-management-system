import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // e.g., "Grade 10"
        },
        division: {
            type: String,
            required: true, // e.g., "A"
        },
        classTeacher: {
            type: String, // Just name for now, or link to User if we had Teacher users distinct
            default: "Not Assigned",
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// Compound index to ensure unique class-division pairs
ClassSchema.index({ name: 1, division: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);
