"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function useRequireAuth(requiredRole?: string) {
    const { isAuthenticated, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (requiredRole && role !== requiredRole) {
                router.push("/unauthorized");
            }
        }
    }, [isAuthenticated, loading, role, requiredRole, router]);

    return { isAuthenticated, role, loading };
}
