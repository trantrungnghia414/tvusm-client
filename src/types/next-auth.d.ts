import "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id?: number;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        role?: string;
        userId?: number;
    }
}
