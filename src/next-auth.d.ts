import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            role?: string
            id?: string
            permissions?: string[]
        } & DefaultSession["user"]
    }

    interface User {
        role?: string
        permissions?: string[]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        permissions?: string[]
    }
}
