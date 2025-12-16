import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // e.g., "Mid-Term Exam"
        },
        academicYear: {
            type: String,
            required: true, // e.g., "2024-2025"
        },
        classes: [
            {
                classId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Class",
                    required: true,
                },
                subjects: [
                    {
                        name: { type: String, required: true },
                        totalMarks: { type: Number, required: true },
                    },
                ],
            }
        ],
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ["Draft", "Published", "Closed"],
            default: "Draft",
        },
    },
    { timestamps: true }
);

// Force model rebuild if schema changes in development
if (mongoose.models.Exam) {
    delete mongoose.models.Exam;
}

export default mongoose.model("Exam", ExamSchema);
