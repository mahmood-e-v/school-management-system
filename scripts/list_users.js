const { loadEnvConfig } = require('@next/env');
const mongoose = require('mongoose');

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
        const users = await User.find({}).select('+password');
        console.log("Users found:", users.length);
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
