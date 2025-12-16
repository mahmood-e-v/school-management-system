import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // e.g., "A+", "B"
        },
        minPercentage: {
            type: Number,
            required: true,
        },
        maxPercentage: {
            type: Number,
            required: true,
        },
        gradePoint: {
            type: Number, // e.g., 4.0, 10.0
            default: 0,
        },
        description: {
            type: String, // e.g., "Outstanding"
        },
    },
    { timestamps: true }
);

export default mongoose.models.Grade || mongoose.model("Grade", GradeSchema);
