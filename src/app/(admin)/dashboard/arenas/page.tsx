"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api"; // Bỏ comment để sử dụng fetchApi
import DashboardLayout from "../components/DashboardLayout";
import ArenaTable from "./components/ArenaTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Arena, ArenaFilters as ArenaFilterType } from "./types/arenaTypes";
import ArenaActions from "@/app/(admin)/dashboard/arenas/components/ArenaActions";
import ArenaFilters from "@/app/(admin)/dashboard/arenas/components/ArenaFilters";

export default function ArenasManagementPage() {
    const [arenas, setArenas] = useState<Arena[]>([]);
    const [filteredArenas, setFilteredArenas] = useState<Arena[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ArenaFilterType>({
        search: "",
        type: [],
        status: [],
        priceRangeFilter: "all",
    });
    const router = useRouter();

    // Fetch arenas
    useEffect(() => {
        const fetchArenas = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                // Gọi API thật để lấy danh sách sân
                const response = await fetchApi("/arenas", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        toast.error("Phiên đăng nhập hết hạn");
                        localStorage.removeItem("token");
                        router.push("/login");
                        return;
                    }
                    throw new Error("Không thể tải danh sách sân");
                }

                const data = await response.json();

                // Chuyển đổi dữ liệu từ API sang định dạng Arena[]
                const formattedArenas: Arena[] = data.map((arena: any) => ({
                    id: arena.arena_id,
                    name: arena.name,
                    address: arena.address,
                    description: arena.description || "",
                    type: arena.type,
                    status: arena.status,
                    images: arena.images || [],
                    price_per_hour: arena.price_per_hour,
                    open_time: arena.open_time,
                    close_time: arena.close_time,
                    created_at: arena.created_at,
                    updated_at: arena.updated_at,
                    sub_arenas: arena.sub_arenas || [],
                    features: arena.features || [],
                    rules: arena.rules || [],
                }));

                setArenas(formattedArenas);
                setFilteredArenas(formattedArenas);
            } catch (error) {
                console.error("Error fetching arenas:", error);
                toast.error("Không thể tải danh sách sân");
            } finally {
                setLoading(false);
            }
        };

        fetchArenas();
    }, [router]);

    // Filter function (giữ nguyên)
    const filterArenas = useCallback(() => {
        let result = [...arenas];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                (arena) =>
                    arena.name.toLowerCase().includes(searchLower) ||
                    arena.address.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (filters.type.length > 0) {
            result = result.filter((arena) =>
                filters.type.includes(arena.type)
            );
        }

        // Apply status filter
        if (filters.status.length > 0) {
            result = result.filter((arena) =>
                filters.status.includes(arena.status)
            );
        }

        // Apply price range filter
        if (filters.priceRangeFilter !== "all") {
            const value = filters.priceRangeFilter;

            if (value.includes("-")) {
                // Khoảng giá có giới hạn trên và dưới
                const [minStr, maxStr] = value.split("-");
                const min = parseInt(minStr);
                const max = parseInt(maxStr);
                result = result.filter(
                    (arena) =>
                        arena.price_per_hour >= min &&
                        arena.price_per_hour <= max
                );
            } else if (value.endsWith("+")) {
                // Giá trên mức nào đó (ví dụ: 1000000+)
                const min = parseInt(value.replace("+", ""));
                result = result.filter((arena) => arena.price_per_hour >= min);
            }
        }

        setFilteredArenas(result);
    }, [arenas, filters]);

    // Apply filters (giữ nguyên)
    useEffect(() => {
        filterArenas();
    }, [filters, arenas, filterArenas]);

    // Handle arena deletion
    const handleDeleteArena = async (id: number) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API thật để xóa sân
            const response = await fetchApi(`/arenas/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Phiên đăng nhập hết hạn");
                    localStorage.removeItem("token");
                    router.push("/login");
                    return;
                }

                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa sân");
            }

            // Update local state
            setArenas(arenas.filter((arena) => arena.id !== id));
            toast.success("Xóa sân thành công");
        } catch (error) {
            console.error("Error deleting arena:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa sân"
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API thật để cập nhật trạng thái sân
            const response = await fetchApi(`/arenas/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Phiên đăng nhập hết hạn");
                    localStorage.removeItem("token");
                    router.push("/login");
                    return;
                }

                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái sân"
                );
            }

            // Update local state
            setArenas(
                arenas.map((arena) =>
                    arena.id === id
                        ? {
                              ...arena,
                              status: newStatus as Arena["status"],
                              updated_at: new Date().toISOString(),
                          }
                        : arena
                )
            );

            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating arena status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái sân"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout activeTab="arenas">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Quản lý sân thể thao</h1>
                    <ArenaActions
                        onAddNew={() => router.push("/dashboard/arenas/add")}
                    />
                </div>

                <ArenaFilters filters={filters} setFilters={setFilters} />

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <ArenaTable
                        arenas={filteredArenas}
                        onDelete={handleDeleteArena}
                        onStatusChange={handleStatusChange}
                        onView={(id) => router.push(`/dashboard/arenas/${id}`)}
                        onEdit={(id) =>
                            router.push(`/dashboard/arenas/${id}/edit`)
                        }
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
