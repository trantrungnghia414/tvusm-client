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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Edit, Plus, Search, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Interface cho danh mục tin tức
interface NewsCategory {
    category_id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: number;
    created_at: string;
}

export default function CategoryForm() {
    const router = useRouter();
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<
        NewsCategory[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // State cho form
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<NewsCategory | null>(
        null
    );
    const [categoryName, setCategoryName] = useState("");
    const [categorySlug, setCategorySlug] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State để theo dõi độ dài và giới hạn ký tự
    const [nameLength, setNameLength] = useState(0);
    const [slugLength, setSlugLength] = useState(0);
    const [descriptionLength, setDescriptionLength] = useState(0);
    const MAX_NAME_LENGTH = 100;
    const MAX_SLUG_LENGTH = 100;
    const MAX_DESCRIPTION_LENGTH = 500;

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

            const response = await fetchApi("/news/categories", {
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
                    category.slug.toLowerCase().includes(searchLower) ||
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

    // Tạo slug từ tên danh mục
    const generateSlugFromName = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    // Tải danh mục khi component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Reset form
    const resetForm = () => {
        setCategoryName("");
        setCategorySlug("");
        setCategoryDescription("");
        setCategoryToEdit(null);
        setIsEditing(false);
        setNameLength(0);
        setSlugLength(0);
        setDescriptionLength(0);
    };

    // Xử lý khi thay đổi tên danh mục
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setCategoryName(name);
        setNameLength(name.length);

        // Chỉ tự động cập nhật slug nếu đang thêm mới hoặc slug chưa được chỉnh sửa
        if (
            !isEditing ||
            (isEditing && categoryToEdit?.name === categoryToEdit?.slug)
        ) {
            const newSlug = generateSlugFromName(name);
            setCategorySlug(newSlug);
            setSlugLength(newSlug.length);
        }
    };

    // Xử lý khi thay đổi slug
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const slug = e.target.value;
        setCategorySlug(slug);
        setSlugLength(slug.length);
    };

    // Mở form chỉnh sửa
    const handleEdit = (category: NewsCategory) => {
        setCategoryToEdit(category);
        setCategoryName(category.name);
        setCategorySlug(category.slug);
        setCategoryDescription(category.description || "");
        setNameLength(category.name.length);
        setSlugLength(category.slug.length);
        setDescriptionLength(category.description?.length || 0);
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

        if (!categorySlug.trim()) {
            toast.error("Vui lòng nhập slug cho danh mục");
            return;
        }

        if (nameLength > MAX_NAME_LENGTH) {
            toast.error(
                `Tên danh mục không được vượt quá ${MAX_NAME_LENGTH} ký tự`
            );
            return;
        }

        if (slugLength > MAX_SLUG_LENGTH) {
            toast.error(`Slug không được vượt quá ${MAX_SLUG_LENGTH} ký tự`);
            return;
        }

        if (descriptionLength > MAX_DESCRIPTION_LENGTH) {
            toast.error(
                `Mô tả không được vượt quá ${MAX_DESCRIPTION_LENGTH} ký tự`
            );
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
                name: categoryName.trim(),
                slug: categorySlug.trim(),
                description: categoryDescription.trim() || undefined,
            };

            let response;
            if (isEditing && categoryToEdit) {
                // Cập nhật danh mục
                response = await fetchApi(
                    `/news/categories/${categoryToEdit.category_id}`,
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
                response = await fetchApi("/news/categories", {
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/news")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Danh mục tin tức</h1>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm danh mục mới
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Danh sách danh mục</CardTitle>
                        <div className="w-64 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm kiếm danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <LoadingSpinner message="Đang tải danh sách danh mục..." />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">
                                            STT
                                        </TableHead>
                                        <TableHead>Tên danh mục</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">
                                            Thao tác
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center h-32"
                                            >
                                                {searchTerm
                                                    ? "Không tìm thấy danh mục phù hợp"
                                                    : "Chưa có danh mục nào"}
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
                                                        {category.name.length >
                                                        50
                                                            ? `${category.name.substring(
                                                                  0,
                                                                  50
                                                              )}...`
                                                            : category.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {category.slug.length >
                                                        50
                                                            ? `${category.slug.substring(
                                                                  0,
                                                                  50
                                                              )}...`
                                                            : category.slug}
                                                    </TableCell>
                                                    <TableCell>
                                                        {category.description
                                                            ? category
                                                                  .description
                                                                  .length > 70
                                                                ? `${category.description.substring(
                                                                      0,
                                                                      70
                                                                  )}...`
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
                                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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

            {/* Dialog thêm/sửa danh mục */}
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
                                ? "Cập nhật thông tin danh mục tin tức."
                                : "Điền thông tin để tạo danh mục tin tức mới."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            {/* Tên danh mục */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category-name">
                                        Tên danh mục{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <span
                                        className={`text-xs ${
                                            nameLength > MAX_NAME_LENGTH
                                                ? "text-red-500 font-medium"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {nameLength}/{MAX_NAME_LENGTH}
                                    </span>
                                </div>
                                <Input
                                    id="category-name"
                                    value={categoryName}
                                    onChange={handleNameChange}
                                    placeholder="Nhập tên danh mục"
                                    disabled={isSubmitting}
                                    className={
                                        nameLength > MAX_NAME_LENGTH
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : ""
                                    }
                                />
                                {nameLength > MAX_NAME_LENGTH && (
                                    <p className="text-xs text-red-500">
                                        Tên danh mục quá dài, vui lòng rút ngắn
                                        lại.
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category-slug">
                                        Slug{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <span
                                        className={`text-xs ${
                                            slugLength > MAX_SLUG_LENGTH
                                                ? "text-red-500 font-medium"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {slugLength}/{MAX_SLUG_LENGTH}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Input
                                            id="category-slug"
                                            value={categorySlug}
                                            onChange={handleSlugChange}
                                            placeholder="nhap-slug-danh-muc"
                                            disabled={isSubmitting}
                                            className={
                                                slugLength > MAX_SLUG_LENGTH
                                                    ? "border-red-500 focus-visible:ring-red-500"
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newSlug =
                                                generateSlugFromName(
                                                    categoryName
                                                );
                                            setCategorySlug(newSlug);
                                            setSlugLength(newSlug.length);
                                        }}
                                        disabled={
                                            !categoryName.trim() || isSubmitting
                                        }
                                        className="whitespace-nowrap"
                                    >
                                        Tạo slug
                                    </Button>
                                </div>
                                {slugLength > MAX_SLUG_LENGTH && (
                                    <p className="text-xs text-red-500">
                                        Slug quá dài, vui lòng rút ngắn lại.
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Slug sẽ được sử dụng trong URL của danh mục.
                                    Chỉ chứa ký tự thường, số và dấu gạch ngang.
                                </p>
                            </div>

                            {/* Mô tả */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category-description">
                                        Mô tả
                                    </Label>
                                    <span
                                        className={`text-xs ${
                                            descriptionLength >
                                            MAX_DESCRIPTION_LENGTH
                                                ? "text-red-500 font-medium"
                                                : "text-muted-foreground"
                                        }`}
                                    >
                                        {descriptionLength}/
                                        {MAX_DESCRIPTION_LENGTH}
                                    </span>
                                </div>
                                <Textarea
                                    id="category-description"
                                    value={categoryDescription}
                                    onChange={(e) => {
                                        setCategoryDescription(e.target.value);
                                        setDescriptionLength(
                                            e.target.value.length
                                        );
                                    }}
                                    placeholder="Nhập mô tả về danh mục (tùy chọn)"
                                    rows={3}
                                    disabled={isSubmitting}
                                    className={
                                        descriptionLength >
                                        MAX_DESCRIPTION_LENGTH
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : ""
                                    }
                                />
                                {descriptionLength > MAX_DESCRIPTION_LENGTH && (
                                    <p className="text-xs text-red-500">
                                        Mô tả quá dài, vui lòng rút ngắn lại.
                                    </p>
                                )}
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
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    !categoryName.trim() ||
                                    !categorySlug.trim() ||
                                    nameLength > MAX_NAME_LENGTH ||
                                    slugLength > MAX_SLUG_LENGTH ||
                                    descriptionLength > MAX_DESCRIPTION_LENGTH
                                }
                            >
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

            {/* Dialog xác nhận xóa */}
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
                            bởi tin tức.
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
