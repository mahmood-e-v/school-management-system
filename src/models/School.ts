import mongoose from "mongoose";

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
    }
}, { timestamps: true });

export default mongoose.models.School || mongoose.model("School", SchoolSchema);
