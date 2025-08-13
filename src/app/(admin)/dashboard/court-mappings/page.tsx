// trang quản lý ghép sân
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CourtMappingTable from "./components/CourtMappingTable";
import { CourtMapping, CourtMappingFormData } from "./types";
import { fetchApi } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtMappingActions from "@/app/(admin)/dashboard/court-mappings/components/CourtMappingActions";
import CourtMappingFilters from "@/app/(admin)/dashboard/court-mappings/components/CourtMappingFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CourtMappingForm from "@/app/(admin)/dashboard/court-mappings/components/CourtMappingForm";

export default function CourtMappingsPage() {
    // States
    const [mappings, setMappings] = useState<CourtMapping[]>([]);
    const [filteredMappings, setFilteredMappings] = useState<CourtMapping[]>(
        []
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [formOpen, setFormOpen] = useState<boolean>(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [selectedMapping, setSelectedMapping] = useState<CourtMapping | null>(
        null
    );
    const [mappingToDelete, setMappingToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [parentCourtFilter, setParentCourtFilter] = useState<string>("all");

    const router = useRouter();

    // Sử dụng useCallback cho fetchMappings để tránh tạo lại hàm này mỗi lần render
    const fetchMappings = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/court-mappings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách ghép sân");
            }

            const data = await response.json();
            setMappings(data);
            setFilteredMappings(data);
        } catch (error) {
            console.error("Error fetching court mappings:", error);
            toast.error("Không thể tải danh sách ghép sân");
        } finally {
            setLoading(false);
        }
    }, [router]); // router là dependency duy nhất của hàm này

    // Tương tự, sử dụng useCallback cho filterMappings
    const filterMappings = useCallback(() => {
        let result = [...mappings];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (mapping) =>
                    (mapping.parent_court_name?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (mapping.child_court_name?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (mapping.position?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (mapping.parent_court_code?.toLowerCase() || "").includes(
                        searchLower
                    ) ||
                    (mapping.child_court_code?.toLowerCase() || "").includes(
                        searchLower
                    )
            );
        }

        // Lọc theo sân cha - Chỉ lọc khi giá trị khác "all"
        if (parentCourtFilter && parentCourtFilter !== "all") {
            result = result.filter(
                (mapping) =>
                    mapping.parent_court_id.toString() === parentCourtFilter
            );
        }

        setFilteredMappings(result);
    }, [mappings, searchTerm, parentCourtFilter]); // thêm đầy đủ dependencies

    // Lấy danh sách ghép sân
    useEffect(() => {
        fetchMappings();
    }, [fetchMappings]); // Thêm fetchMappings vào dependency array

    // Lọc dữ liệu khi searchTerm hoặc filters thay đổi
    useEffect(() => {
        filterMappings();
    }, [filterMappings]); // Thêm filterMappings vào dependency array

    const handleAddMapping = () => {
        setSelectedMapping(null);
        setFormOpen(true);
    };

    const handleEditMapping = (mappingId: number) => {
        const mapping = mappings.find((m) => m.mapping_id === mappingId);
        if (mapping) {
            setSelectedMapping(mapping);
            setFormOpen(true);
        }
    };

    const handleDeleteMapping = (mappingId: number) => {
        setMappingToDelete(mappingId);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!mappingToDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(
                `/court-mappings/${mappingToDelete}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa ghép sân");
            }

            toast.success("Xóa ghép sân thành công");
            setConfirmDeleteOpen(false);

            // Cập nhật danh sách sau khi xóa
            setMappings(
                mappings.filter(
                    (mapping) => mapping.mapping_id !== mappingToDelete
                )
            );
        } catch (error) {
            console.error("Error deleting court mapping:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa ghép sân"
            );
        }
    };

    const handleSubmitMapping = async (data: CourtMappingFormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            let response;

            if (selectedMapping) {
                // Cập nhật mapping hiện có
                response = await fetchApi(
                    `/court-mappings/${selectedMapping.mapping_id}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                    }
                );
            } else {
                // Tạo mapping mới
                response = await fetchApi("/court-mappings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể lưu thông tin ghép sân"
                );
            }

            toast.success(
                selectedMapping
                    ? "Cập nhật ghép sân thành công"
                    : "Thêm ghép sân thành công"
            );
            setFormOpen(false);
            fetchMappings(); // Làm mới danh sách
        } catch (error) {
            console.error("Error saving court mapping:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể lưu thông tin ghép sân"
            );
        }
    };

    return (
        <DashboardLayout activeTab="court-mappings">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý ghép sân</h1>
                    <CourtMappingActions onAddMapping={handleAddMapping} />
                </div>

                <CourtMappingFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    parentCourtFilter={parentCourtFilter}
                    setParentCourtFilter={setParentCourtFilter}
                />

                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách ghép sân..." />
                ) : (
                    <CourtMappingTable
                        mappings={filteredMappings}
                        onEdit={handleEditMapping}
                        onDelete={handleDeleteMapping}
                    />
                )}
            </div>

            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedMapping
                                ? "Chỉnh sửa ghép sân"
                                : "Thêm ghép sân mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedMapping
                                ? "Cập nhật thông tin ghép sân"
                                : "Thêm mối quan hệ sân cha-con mới"}
                        </DialogDescription>
                    </DialogHeader>
                    <CourtMappingForm
                        onSubmit={handleSubmitMapping}
                        existingMapping={selectedMapping}
                        onCancel={() => setFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Bạn có chắc chắn muốn xóa?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này sẽ xóa mối quan hệ ghép sân và không
                            thể khôi phục.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
