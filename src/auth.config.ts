import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
        async session({ session, token }) {
            try {
                // console.log("Session callback triggered");
                if (session.user) {
                    if (token.sub) {
                        session.user.id = token.sub;
                    }
                    if (token.role) {
                        session.user.role = token.role as string;
                    }
                    if (token.permissions) {
                        session.user.permissions = token.permissions as string[];
                    }
                }
                return session;
            } catch (error) {
                console.error("Session Callback Error:", error);
                return session;
            }
        },
        async jwt({ token, user, trigger, session }) {
            try {
                // console.log("JWT callback triggered", { trigger });

                // Initial sign in
                if (user) {
                    token.role = (user as any).role;
                    token.permissions = (user as any).permissions;
                    token.id = user.id;
                }

                // Update session
                if (trigger === "update" && session) {
                    token = { ...token, ...session };
                }

                return token;
            } catch (error) {
                console.error("JWT Callback Error:", error);
                return token;
            }
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
