"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchApi } from "./api";

type AuthContextType = {
    isAuthenticated: boolean;
    token: string | null;
    role: string | null;
    loading: boolean;
    user: {
        id?: number;
        username?: string;
        email?: string;
        avatar?: string;
        name?: string;
    } | null;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: null,
    role: null,
    loading: true,
    user: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [user, setUser] = useState<AuthContextType["user"]>(null);

    useEffect(() => {
        // Kiểm tra token từ session (đăng nhập Google)
        if (session?.accessToken) {
            setToken(session.accessToken);
            setRole(session.user.role || null);
            setUser({
                id: session.user.id,
                email: session.user.email || undefined,
                name: session.user.name || undefined,
                avatar: session.user.image || undefined,
            });
            return;
        }

        // Kiểm tra token từ localStorage (đăng nhập thông thường)
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
            // Fetch thông tin người dùng để lấy role
            fetchUserInfo(storedToken).then((userData) => {
                if (userData) {
                    setRole(userData.role);
                    setUser({
                        id: userData.user_id,
                        username: userData.username,
                        email: userData.email,
                        avatar: userData.avatar,
                        name: userData.name,
                    });
                }
            });
        }
    }, [session]);

    async function fetchUserInfo(token: string) {
        try {
            const response = await fetchApi("/users/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error("Error fetching user info:", error);
            return null;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!token,
                token,
                role,
                loading: status === "loading",
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
