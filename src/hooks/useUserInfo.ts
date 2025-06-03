import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface UserProfile {
    user_id: number;
    username: string;
    email: string;
    full_name?: string;
    phone?: string;
    avatar?: string;
    role?: string;
}

export function useUserInfo() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setIsLoading(false);
                setIsLoggedIn(false);
                return;
            }

            try {
                const response = await fetchApi("/users/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                    setIsLoggedIn(true);
                } else {
                    // Token không hợp lệ, xóa khỏi localStorage
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    return { userProfile, isLoading, isLoggedIn };
}
