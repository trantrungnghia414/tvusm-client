// trang quản lý loại sân
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtTypeFilters from "./components/CourtTypeFilters";
import { CourtType } from "./types";
import CourtTypeActions from "@/app/(admin)/dashboard/court-types/components/CourtTypeActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CourtTypeTable from "@/app/(admin)/dashboard/court-types/components/CourtTypeTable";

export default function CourtTypesPage() {
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
    const [filteredCourtTypes, setFilteredCourtTypes] = useState<CourtType[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    // Lấy danh sách loại sân
    useEffect(() => {
        const fetchCourtTypes = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                // Gọi API để lấy danh sách loại sân
                const response = await fetchApi("/court-types", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách loại sân");
                }

                const data = await response.json();
                setCourtTypes(data);
                setFilteredCourtTypes(data);
            } catch (error) {
                console.error("Error fetching court types:", error);
                toast.error("Không thể tải danh sách loại sân");
            } finally {
                setLoading(false);
            }
        };

        fetchCourtTypes();
    }, [router]);

    // Lọc loại sân theo từ khóa tìm kiếm
    useEffect(() => {
        let result = [...courtTypes];

        // Lọc theo từ khóa tìm kiếmm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (courtType) =>
                    courtType.name.toLowerCase().includes(searchLower) ||
                    (courtType.description?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (courtType.standard_size?.toLowerCase() || "").includes(
                        searchLower
                    )
            );
        }

        setFilteredCourtTypes(result);
    }, [courtTypes, searchTerm]);

    // Xử lý xóa loại sân
    const handleDeleteCourtType = async (typeId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để xóa loại sân
            const response = await fetchApi(`/court-types/${typeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa loại sân");
            }

            // Cập nhật danh sách loại sân sau khi xóa
            setCourtTypes(courtTypes.filter((type) => type.type_id !== typeId));
            toast.success("Xóa loại sân thành công");
        } catch (error) {
            console.error("Error deleting court type:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa loại sân"
            );
        }
    };

    // Điều hướng đến trang thêm loại sân
    const handleAddCourtType = () => {
        router.push("/dashboard/court-types/add");
    };

    // Điều hướng đến trang chỉnh sửa loại sân
    const handleEditCourtType = (typeId: number) => {
        router.push(`/dashboard/court-types/${typeId}/edit`);
    };

    return (
        <DashboardLayout activeTab="court-types">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Quản lý loại sân thể thao
                    </h1>
                    <CourtTypeActions
                        onAddCourtType={handleAddCourtType}
                        courtTypes={filteredCourtTypes}
                    />
                </div>

                <CourtTypeFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách loại sân..." />
                ) : (
                    <CourtTypeTable
                        courtTypes={filteredCourtTypes}
                        onDelete={handleDeleteCourtType}
                        onEdit={handleEditCourtType}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
