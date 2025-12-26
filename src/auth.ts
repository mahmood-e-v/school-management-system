import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

async function getUser(email: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email }).select("+password");
        return user;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    pages: authConfig.pages,
    callbacks: authConfig.callbacks,
    providers: [
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log("Authorize called with:", credentials?.email);
                    const parsedCredentials = z
                        .object({ email: z.string().email(), password: z.string().min(6) })
                        .safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        const user = await getUser(email);
                        if (!user) {
                            console.log("User not found for email:", email);
                            return null;
                        }

                        console.log("User found:", user.email, "comparing passwords");
                        const passwordsMatch = await bcrypt.compare(password, user.password);

                        if (passwordsMatch) {
                            console.log("Password match success");
                            // Return a plain object to avoid serialization issues with Mongoose documents
                            return {
                                id: user._id.toString(),
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                permissions: user.permissions ? Array.from(user.permissions) : [],
                            };
                        }
                        console.log("Password mismatch");
                    } else {
                        console.log("Zod parsing failed:", parsedCredentials.error);
                    }

                    console.log("Invalid credentials");
                    return null;
                } catch (error) {
                    console.error("Authorize Error:", error);
                    return null;
                }
            },
        }),
    ],
    secret: process.env.AUTH_SECRET, // Explicitly load secret
    session: { strategy: "jwt" },
    debug: true,
});
