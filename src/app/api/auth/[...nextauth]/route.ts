// Tạo API Routes cho NextAuth

import NextAuth, { Account, Profile, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { fetchApi } from "@/lib/api";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({
            account,
            profile,
        }: {
            account: Account | null;
            profile?: Profile;
        }) {
            if (account?.provider === "google" && profile?.email) {
                return true;
            }
            return false;
        },
        async jwt({
            token,
            account,
            profile,
        }: {
            token: JWT;
            account: Account | null;
            profile?: Profile | undefined;
        }) {
            // Khi người dùng đăng nhập thành công với Google
            if (account && profile) {
                try {
                    // Gọi API đến server để xử lý đăng nhập/đăng ký Google
                    const response = await fetchApi("/users/google-auth", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: profile.email,
                            name: profile.name,
                            picture: profile.image,
                            googleId: account.providerAccountId,
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Lưu access token từ backend vào JWT token
                        token.accessToken = data.access_token;
                        token.role = data.role;
                        token.userId = data.id;

                        console.log(
                            "Token từ API Google Auth:",
                            data.access_token
                        );
                    }
                } catch (error) {
                    console.error("Google auth error:", error);
                }
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Thêm thông tin accessToken và role vào session
            session.accessToken = token.accessToken;
            session.user.role = token.role;
            session.user.id = token.userId;

            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
