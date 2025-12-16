import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
    {
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        marks: [
            {
                subject: { type: String, required: true },
                obtained: { type: Number, required: true },
                total: { type: Number, required: true },
                remarks: { type: String }, // Subject-specific remark
            },
        ],
        classTeacherRemark: { type: String },
        principalRemark: { type: String },
    },
    { timestamps: true }
);

// Ensure one result per student per exam
ResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// Force model rebuild if schema changes in development
if (mongoose.models.Result) {
    delete mongoose.models.Result;
}

export default mongoose.model("Result", ResultSchema);
