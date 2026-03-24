import mongoose from "mongoose";

// School settings model for storing global information like logos and signatures.
const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Madrasa Wadi Rahma"
    },
    address: {
        type: String,
        required: true,
        default: "Falaj Haza' Al Ain"
    },
    logo: {
        type: String,
        required: true,
        default: "https://placehold.co/80x80?text=Logo"
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    currentAcademicYear: {
        type: String,
        required: true,
        default: "2025-26"
    },
    academicYearStartDate: {
        type: Date
    },
    academicYearEndDate: {
        type: Date
    },
    classTeacherSignature: {
        type: String,
        default: ""
    },
    sadarMuallimSignature: {
        type: String,
        default: ""
    },
    sadarMuallimName: {
        type: String,
        default: ""
    },
    classTeacherSignatures: [{
        teacherName: { type: String, required: true },
        signature: { type: String, required: true }
    }]
}, { timestamps: true });

export default mongoose.models.School || mongoose.model("School", SchoolSchema);
