import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        records: [
            {
                studentId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["Present", "Absent", "Late"],
                    default: "Present",
                },
                remark: String,
            },
        ],
    },
    { timestamps: true }
);

// Ensure one attendance record per class per day
AttendanceSchema.index({ classId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance ||
    mongoose.model("Attendance", AttendanceSchema);
