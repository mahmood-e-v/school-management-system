const { loadEnvConfig } = require('@next/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

loadEnvConfig(process.cwd());

const UserSchema = new mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, unique: true },
        password: { type: String, select: false },
        role: { type: String },
        permissions: { type: [String] },
        image: { type: String },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not defined in environment");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        
        const newPassword = "admin123"; // Will reset to admin123
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const result = await User.findOneAndUpdate(
            { email: "admin@school.com" },
            { $set: { password: hashedPassword } },
            { new: true }
        );
        
        if (result) {
            console.log("Successfully reset password for admin@school.com to: " + newPassword);
        } else {
            console.log("User admin@school.com not found!");
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
