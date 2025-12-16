import mongoose from "mongoose";

const RemarkSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true, // e.g., "Excellent performance", "Needs improvement"
        },
        type: {
            type: String,
            enum: ["Subject", "ClassTeacher", "Principal", "General"],
            default: "General",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Remark || mongoose.model("Remark", RemarkSchema);
