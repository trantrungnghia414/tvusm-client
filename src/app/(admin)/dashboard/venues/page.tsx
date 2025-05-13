"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import { Venue } from "./types/venueTypes";
import VenueTable from "./components/VenueTable";
import VenueFilters from "./components/VenueFilters";
import VenueActions from "./components/VenueActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function VenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const router = useRouter();

    // Lấy danh sách nhà thi đấu
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                // Gọi API để lấy danh sách nhà thi đấu
                const response = await fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách nhà thi đấu");
                }

                const data = await response.json();
                setVenues(data);
                setFilteredVenues(data);
            } catch (error) {
                console.error("Error fetching venues:", error);
                toast.error("Không thể tải danh sách nhà thi đấu");
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, [router]);

    // Lọc nhà thi đấu theo các tiêu chí
    useEffect(() => {
        let result = [...venues];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (venue) =>
                    venue.name.toLowerCase().includes(searchLower) ||
                    venue.location.toLowerCase().includes(searchLower)
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((venue) => venue.status === statusFilter);
        }

        setFilteredVenues(result);
    }, [venues, searchTerm, statusFilter]);

    // Xử lý xóa nhà thi đấu
    const handleDeleteVenue = async (venueId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để xóa nhà thi đấu
            const response = await fetchApi(`/venues/${venueId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể xóa nhà thi đấu"
                );
            }

            // Cập nhật danh sách nhà thi đấu sau khi xóa
            setVenues(venues.filter((venue) => venue.venue_id !== venueId));
            toast.success("Xóa nhà thi đấu thành công");
        } catch (error) {
            console.error("Error deleting venue:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa nhà thi đấu"
            );
        }
    };

    // Xử lý thay đổi trạng thái nhà thi đấu
    const handleToggleVenueStatus = async (
        venueId: number,
        newStatus: "active" | "maintenance" | "inactive"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật trạng thái nhà thi đấu
            const response = await fetchApi(`/venues/${venueId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật trạng thái nhà thi đấu"
                );
            }

            // Cập nhật danh sách nhà thi đấu sau khi thay đổi trạng thái
            setVenues(
                venues.map((venue) =>
                    venue.venue_id === venueId
                        ? { ...venue, status: newStatus }
                        : venue
                )
            );
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating venue status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái nhà thi đấu"
            );
        }
    };

    // Điều hướng đến trang thêm nhà thi đấu
    const handleAddVenue = () => {
        router.push("/dashboard/venues/add");
    };

    // Điều hướng đến trang chỉnh sửa nhà thi đấu
    const handleEditVenue = (venueId: number) => {
        router.push(`/dashboard/venues/${venueId}/edit`);
    };

    return (
        <DashboardLayout activeTab="venues">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý nhà thi đấu</h1>
                    <VenueActions
                        onAddVenue={handleAddVenue}
                        venues={filteredVenues}
                    />
                </div>

                <VenueFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách nhà thi đấu..." />
                ) : (
                    <VenueTable
                        venues={filteredVenues}
                        onDelete={handleDeleteVenue}
                        onToggleStatus={handleToggleVenueStatus}
                        onEdit={handleEditVenue}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
