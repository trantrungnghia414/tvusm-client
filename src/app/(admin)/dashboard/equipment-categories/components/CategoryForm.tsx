"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, ArrowLeft, Plus, Search, X } from "lucide-react";

interface EquipmentCategory {
    category_id: number;
    name: string;
    description: string | null;
    created_at: string;
}

export default function CategoryForm() {
    const router = useRouter();
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<
        EquipmentCategory[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // State cho form
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [categoryToEdit, setCategoryToEdit] =
        useState<EquipmentCategory | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho xóa
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch danh sách danh mục
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/equipment/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách danh mục");
            }

            const data = await response.json();
            setCategories(data);
            setFilteredCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Lọc danh mục theo từ khóa tìm kiếm
    useEffect(() => {
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const filtered = categories.filter(
                (category) =>
                    category.name.toLowerCase().includes(searchLower) ||
                    (category.description &&
                        category.description
                            .toLowerCase()
                            .includes(searchLower))
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [searchTerm, categories]);

    // Tải danh mục khi component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Reset form
    const resetForm = () => {
        setCategoryName("");
        setCategoryDescription("");
        setCategoryToEdit(null);
        setIsEditing(false);
    };

    // Mở form chỉnh sửa
    const handleEdit = (category: EquipmentCategory) => {
        setCategoryToEdit(category);
        setCategoryName(category.name);
        setCategoryDescription(category.description || "");
        setIsEditing(true);
        setFormDialogOpen(true);
    };

    // Mở form thêm mới
    const handleAdd = () => {
        resetForm();
        setFormDialogOpen(true);
    };

    // Xác nhận xóa
    const handleDeleteClick = (categoryId: number) => {
        setCategoryToDelete(categoryId);
        setDeleteDialogOpen(true);
    };

    // Xử lý submit form (thêm hoặc cập nhật)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            toast.error("Vui lòng nhập tên danh mục");
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                return;
            }

            const data = {
                name: categoryName,
                description: categoryDescription.trim() || undefined,
            };

            let response;
            if (isEditing && categoryToEdit) {
                // Cập nhật danh mục
                response = await fetchApi(
                    `/equipment/categories/${categoryToEdit.category_id}`,
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
                // Thêm danh mục mới
                response = await fetchApi("/equipment/categories", {
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
                throw new Error(errorData.message || "Không thể lưu danh mục");
            }

            toast.success(
                isEditing
                    ? "Cập nhật danh mục thành công"
                    : "Thêm danh mục thành công"
            );
            setFormDialogOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể lưu danh mục"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Xử lý xóa danh mục
    const handleDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                return;
            }

            const response = await fetchApi(
                `/equipment/categories/${categoryToDelete}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa danh mục");
            }

            toast.success("Xóa danh mục thành công");
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa danh mục"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    // Format ngày tháng
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/equipments")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Quản lý danh mục thiết bị
                    </h1>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
                </Button>
            </div>

            {/* Search Box */}
            <Card className="overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Tìm kiếm danh mục..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <X
                                    className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                                    onClick={() => setSearchTerm("")}
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách danh mục</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-lg">
                                Đang tải dữ liệu...
                            </span>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">
                                            STT
                                        </TableHead>
                                        <TableHead>Tên danh mục</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead className="w-[100px]">
                                            Ngày tạo
                                        </TableHead>
                                        <TableHead className="text-right w-[100px]">
                                            Thao tác
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center"
                                            >
                                                Không có danh mục nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCategories.map(
                                            (category, index) => (
                                                <TableRow
                                                    key={category.category_id}
                                                >
                                                    <TableCell className="text-center">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {category.name.length > 20
                                                            ? `${category.name.substring(0, 20)}...`
                                                            : category.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {category.description
                                                         ? category.description.length > 70
                                                          ? `${category.description.substring(0, 70)}...`
                                                          : category.description
                                                         : "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            category.created_at
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Edit
                                                                </span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        category.category_id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Delete
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        Tổng số: {filteredCategories.length} danh mục
                    </div>
                </CardFooter>
            </Card>

            {/* Form Dialog */}
            <Dialog
                open={formDialogOpen}
                onOpenChange={(open) => {
                    setFormDialogOpen(open);
                    if (!open) resetForm();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing
                                ? "Chỉnh sửa danh mục"
                                : "Thêm danh mục mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Cập nhật thông tin danh mục thiết bị."
                                : "Điền thông tin để tạo danh mục thiết bị mới."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="category-name">
                                    Tên danh mục{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="category-name"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    placeholder="Nhập tên danh mục"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category-description">
                                    Mô tả
                                </Label>
                                <Textarea
                                    id="category-description"
                                    value={categoryDescription}
                                    onChange={(e) =>
                                        setCategoryDescription(e.target.value)
                                    }
                                    placeholder="Nhập mô tả về danh mục (tùy chọn)"
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : isEditing ? (
                                    "Cập nhật"
                                ) : (
                                    "Thêm danh mục"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa danh mục
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục này? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                        <div className="mt-2 text-red-500 font-medium">
                            Lưu ý: Bạn không thể xóa danh mục đang được sử dụng
                            bởi thiết bị.
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
