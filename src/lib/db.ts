import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // Only throw in development/runtime if actually trying to connect, not at import time
    // console.warn("MONGODB_URI is not defined");
}

interface MongooseConn {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
}

// Global cached connection
let cached: MongooseConn = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;

        // Attempt to fetch and log the current public IP to help the user debugging
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json() as { ip: string };
            console.error(`\n❌ MONGODB CONNECTION ERROR\n--------------------------\nCould not connect to MongoDB. This is likely due to your IP address not being whitelisted.\n\n👉 Your CURRENT PUBLIC IP is: ${data.ip}\n\n👉 Please add this IP to your MongoDB Atlas whitelist here:\n   https://cloud.mongodb.com/v2#/security/network/accessList\n--------------------------\n`);
        } catch (err) {
            console.error("\n❌ MONGODB CONNECTION ERROR: Could not connect to MongoDB, and failed to retrieve public IP.", err);
        }

        throw e;
    }

    return cached.conn;
}

export default dbConnect;
