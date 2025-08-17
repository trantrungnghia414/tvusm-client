// trang quản lý sân thể thao
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtTable from "./components/CourtTable";
import CourtFilters from "./components/CourtFilters";
import CourtActions from "./components/CourtActions";
import { Court } from "./types/courtTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CourtsPage() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [venueFilter, setVenueFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const router = useRouter();

    // Lấy danh sách sân
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                // Gọi API để lấy danh sách sân
                const response = await fetchApi("/courts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách sân");
                }

                const data = await response.json();
                setCourts(data);
                setFilteredCourts(data);
            } catch (error) {
                console.error("Error fetching courts:", error);
                toast.error("Không thể tải danh sách sân");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [router]);

    // Lọc sân theo các tiêu chí
    useEffect(() => {
        let result = [...courts];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (court) =>
                    court.name.toLowerCase().includes(searchLower) ||
                    court.code.toLowerCase().includes(searchLower) ||
                    (court.description?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (court.venue_name?.toLowerCase() || "").includes(
                        searchLower
                    )
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((court) => court.status === statusFilter);
        }

        // Lọc theo nhà thi đấu
        if (venueFilter !== "all") {
            result = result.filter(
                (court) => court.venue_id.toString() === venueFilter
            );
        }

        // Lọc theo loại sân
        if (typeFilter !== "all") {
            result = result.filter(
                (court) => court.type_id.toString() === typeFilter
            );
        }

        setFilteredCourts(result);
    }, [courts, searchTerm, statusFilter, venueFilter, typeFilter]);

    // Xử lý xóa sân
    const handleDeleteCourt = async (courtId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để xóa sân
            const response = await fetchApi(`/courts/${courtId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa sân");
            }

            // Cập nhật danh sách sân sau khi xóa
            setCourts(courts.filter((court) => court.court_id !== courtId));
            toast.success("Xóa sân thành công");
        } catch (error) {
            console.error("Error deleting court:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa sân"
            );
        }
    };

    // Xử lý thay đổi trạng thái sân
    const handleToggleCourtStatus = async (
        courtId: number,
        newStatus: "available" | "maintenance"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật trạng thái sân
            const response = await fetchApi(`/courts/${courtId}`, {
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
                    errorData.message || "Không thể cập nhật trạng thái sân"
                );
            }

            // Cập nhật danh sách sân sau khi thay đổi trạng thái
            setCourts(
                courts.map((court) =>
                    court.court_id === courtId
                        ? { ...court, status: newStatus }
                        : court
                )
            );
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating court status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái sân"
            );
        }
    };

    // Điều hướng đến trang thêm sân
    const handleAddCourt = () => {
        router.push("/dashboard/courts/add");
    };

    // Điều hướng đến trang chỉnh sửa sân
    const handleEditCourt = (courtId: number) => {
        router.push(`/dashboard/courts/${courtId}/edit`);
    };

    return (
        <DashboardLayout activeTab="courts">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý sân thể thao</h1>
                    <CourtActions
                        onAddCourt={handleAddCourt}
                        courts={filteredCourts}
                    />
                </div>

                <CourtFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    venueFilter={venueFilter}
                    setVenueFilter={setVenueFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                />

                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách sân..." />
                ) : (
                    <CourtTable
                        courts={filteredCourts}
                        onDelete={handleDeleteCourt}
                        onToggleStatus={handleToggleCourtStatus}
                        onEdit={handleEditCourt}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
