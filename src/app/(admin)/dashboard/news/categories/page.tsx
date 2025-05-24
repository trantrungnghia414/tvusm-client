"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus, Edit, Trash2, Tag, MoreHorizontal } from "lucide-react";

// import DashboardLayout from "@/app/(admin)/dashboard/components/layout/DashboardLayout";
// import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

import { NewsCategory } from "../types/newsTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NewsCategoriesPage() {
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filteredCategories, setFilteredCategories] = useState<
        NewsCategory[]
    >([]);

    // State cho form thêm/sửa
    const [formOpen, setFormOpen] = useState<boolean>(false);
    const [formTitle, setFormTitle] = useState<string>("Thêm danh mục");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [name, setName] = useState<string>("");
    const [slug, setSlug] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isActive, setIsActive] = useState<boolean>(true);
    const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

    // State cho xác nhận xóa
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(
        null
    );

    const router = useRouter();

    // Lấy danh sách danh mục
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để tiếp tục");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/news/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách danh mục");
            }

            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Không thể tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Lọc danh mục theo từ khóa tìm kiếm
    useEffect(() => {
        let result = [...categories];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (category) =>
                    category.name.toLowerCase().includes(searchLower) ||
                    category.slug.toLowerCase().includes(searchLower) ||
                    (category.description?.toLowerCase() || "").includes(
                        searchLower
                    )
            );
        }

        setFilteredCategories(result);
    }, [categories, searchTerm]);

    // Lấy danh sách danh mục khi component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Reset form
    const resetForm = () => {
        setCategoryId(null);
        setName("");
        setSlug("");
        setDescription("");
        setIsActive(true);
        setFormTitle("Thêm danh mục");
    };

    // Mở form thêm danh mục
    const handleAddCategory = () => {
        resetForm();
        setFormOpen(true);
    };

    // Mở form chỉnh sửa danh mục
    const handleEditCategory = (category: NewsCategory) => {
        setCategoryId(category.category_id);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description || "");
        setIsActive(category.is_active);
        setFormTitle("Chỉnh sửa danh mục");
        setFormOpen(true);
    };

    // Xử lý xóa danh mục
    const handleDeleteCategory = (categoryId: number) => {
        setCategoryToDelete(categoryId);
        setConfirmDeleteOpen(true);
    };

    // Xác nhận xóa danh mục
    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(
                `/news/categories/${categoryToDelete}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa danh mục");
            }

            // Cập nhật danh sách sau khi xóa
            setCategories(
                categories.filter((cat) => cat.category_id !== categoryToDelete)
            );
            toast.success("Xóa danh mục thành công");
            setConfirmDeleteOpen(false);
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể xóa danh mục"
            );
        }
    };

    // Xử lý nộp form
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate input
        if (!name.trim()) {
            toast.error("Tên danh mục không được để trống");
            return;
        }

        try {
            setFormSubmitting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const formData = {
                name,
                slug: slug || undefined,
                description: description || undefined,
                is_active: isActive,
            };

            let response;

            // Update or Create based on categoryId
            if (categoryId) {
                response = await fetchApi(`/news/categories/${categoryId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                });
            } else {
                response = await fetchApi("/news/categories", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu danh mục");
            }

            toast.success(
                categoryId
                    ? "Cập nhật danh mục thành công"
                    : "Thêm danh mục thành công"
            );

            setFormOpen(false);
            fetchCategories(); // Refresh list
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể lưu danh mục"
            );
        } finally {
            setFormSubmitting(false);
        }
    };

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);

        // Only auto-generate slug if user hasn't manually edited it yet or if it's empty
        if (!slug || slug === generateSlug(name)) {
            setSlug(generateSlug(e.target.value));
        }
    };

    // Helper function to generate slug
    const generateSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    return (
        <DashboardLayout activeTab="news">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Quản lý danh mục tin tức
                    </h1>
                    <Button onClick={handleAddCategory}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm danh mục
                    </Button>
                </div>

                {/* Search input */}
                <div className="relative">
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                {/* Categories list */}
                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách danh mục..." />
                ) : filteredCategories.length > 0 ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14">#</TableHead>
                                    <TableHead>Tên danh mục</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">
                                        Hành động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category, index) => (
                                    <TableRow key={category.category_id}>
                                        <TableCell className="font-medium">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Tag className="h-4 w-4 text-blue-500" />
                                                <span>{category.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{category.slug}</TableCell>
                                        <TableCell>
                                            {category.is_active ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    Kích hoạt
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-gray-500"
                                                >
                                                    Vô hiệu hóa
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Mở menu
                                                        </span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEditCategory(
                                                                category
                                                            )
                                                        }
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        <span>Chỉnh sửa</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() =>
                                                            handleDeleteCategory(
                                                                category.category_id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Xóa</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-10 border rounded-lg bg-white">
                        <Tag className="mx-auto h-10 w-10 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            Không có danh mục nào
                        </h3>
                        <p className="mt-1 text-gray-500">
                            Chưa có danh mục nào được thêm vào hệ thống.
                        </p>
                    </div>
                )}
            </div>

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{formTitle}</DialogTitle>
                        <DialogDescription>
                            Điền thông tin danh mục tin tức bên dưới. Nhấn lưu
                            khi hoàn tất.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitForm}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Tên danh mục{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Nhập tên danh mục"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="Để trống để tạo tự động"
                                />
                                <p className="text-xs text-gray-500">
                                    Định dạng URL của danh mục, ví dụ: the-thao
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Mô tả danh mục (không bắt buộc)"
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                                <Label htmlFor="is_active">Kích hoạt</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormOpen(false)}
                                disabled={formSubmitting}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={formSubmitting}>
                                {formSubmitting ? "Đang lưu..." : "Lưu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa danh mục
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục này? Hành động
                            này không thể hoàn tác.
                            <p className="mt-2 font-medium text-red-600">
                                Lưu ý: Xóa danh mục có thể ảnh hưởng đến các tin
                                tức thuộc danh mục này.
                            </p>
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
