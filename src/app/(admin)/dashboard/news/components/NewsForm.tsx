"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Info, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Card,
    CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { AlertCircle } from "lucide-react";

import { News, NewsCategory } from "../types/newsTypes";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Import editor
// import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface NewsFormProps {
    news?: News;
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

export default function NewsForm({
    news,
    onSubmit,
    isSubmitting = false,
}: NewsFormProps) {
    const [title, setTitle] = useState(news?.title || "");
    const [content, setContent] = useState(news?.content || "");
    const [summary, setSummary] = useState(news?.summary || "");
    const [slug, setSlug] = useState(news?.slug || "");
    const [categoryId, setCategoryId] = useState<string>(
        news?.category_id ? news.category_id.toString() : ""
    );
    const [status, setStatus] = useState<string>(news?.status || "draft");
    const [isFeatured, setIsFeatured] = useState<number>(
        news?.is_featured ?? 0
    );
    const [isInternal, setIsInternal] = useState<number>(
        news?.is_internal ?? 0
    );

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        news?.thumbnail ? getImageUrl(news.thumbnail) : null
    );

    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [slugGenerated, setSlugGenerated] = useState(!news);
    // const [errorMessage, setErrorMessage] = useState("");

    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategorySlug, setNewCategorySlug] = useState("");
    const [addingCategory, setAddingCategory] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Tự động tạo slug từ tiêu đề
    useEffect(() => {
        if (slugGenerated && title) {
            // Tạo slug từ tiêu đề
            const generatedSlug = title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            setSlug(generatedSlug);
        }
    }, [title, slugGenerated]);

    // Hàm lấy URL ảnh
    function getImageUrl(path: string | undefined | null): string | null {
        if (!path) return null;

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        return `http://localhost:3000${path}?t=${timestamp}`;
    }

    // Fetch danh mục tin tức
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

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
            }
        };

        fetchCategories();
    }, []);

    // Xử lý khi người dùng chọn thumbnail
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Kiểm tra định dạng file
        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/gif",
            "image/webp",
        ];

        if (!validTypes.includes(file.type)) {
            toast.error(
                "Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF hoặc WEBP"
            );
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Lưu file và tạo URL xem trước
        setThumbnailFile(file);
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
    };

    // Xử lý xóa thumbnail
    const handleClearThumbnail = () => {
        if (
            thumbnailPreview &&
            !thumbnailPreview.startsWith("http://localhost")
        ) {
            URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailFile(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Kiểm tra form trước khi gửi
    const validateForm = (): boolean => {
        if (!title.trim()) {
            toast.error("Vui lòng nhập tiêu đề");
            return false;
        }

        if (!categoryId) {
            toast.error("Vui lòng chọn danh mục");
            return false;
        }

        if (!content.trim()) {
            toast.error("Vui lòng nhập nội dung");
            return false;
        }

        if (!slug.trim()) {
            toast.error("Vui lòng nhập đường dẫn SEO");
            return false;
        }

        return true;
    };

    // Xử lý submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("summary", summary);
            formData.append("slug", slug);
            formData.append("category_id", categoryId);
            formData.append("status", status);
            formData.append("is_featured", isFeatured.toString());
            formData.append("is_internal", isInternal.toString());

            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            }

            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Có lỗi xảy ra khi lưu tin tức");
        }
    };

    // Thêm hàm tạo slug từ tên danh mục
    const generateSlugFromName = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    // Thêm hàm xử lý khi thay đổi tên danh mục
    const handleCategoryNameChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const name = e.target.value;
        setNewCategoryName(name);
        setNewCategorySlug(generateSlugFromName(name));
    };

    // Thêm hàm tạo danh mục mới
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Vui lòng nhập tên danh mục");
            return;
        }

        if (!newCategorySlug.trim()) {
            toast.error("Vui lòng nhập slug cho danh mục");
            return;
        }

        setAddingCategory(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                return;
            }

            const response = await fetchApi("/news/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    slug: newCategorySlug,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo danh mục");
            }

            const newCategory = await response.json();

            // Thêm danh mục mới vào danh sách và chọn nó
            setCategories([...categories, newCategory]);
            setCategoryId(newCategory.category_id.toString());

            // Reset form thêm danh mục
            setNewCategoryName("");
            setNewCategorySlug("");
            setShowAddCategory(false);

            toast.success("Tạo danh mục thành công");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo danh mục"
            );
        } finally {
            setAddingCategory(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Phần chính: Tiêu đề, nội dung, tóm tắt */}
                <div className="lg:col-span-2 space-y-6">
                    {/* {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {errorMessage}
                        </div>
                    )} */}

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin bài viết</CardTitle>
                            <CardDescription>
                                Nhập các thông tin chính cho bài viết
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Tiêu đề */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Tiêu đề{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết"
                                />
                            </div>

                            {/* Đường dẫn SEO */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="slug">
                                        Đường dẫn SEO{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger type="button">
                                                <Info className="h-4 w-4 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="w-[200px]">
                                                    Đường dẫn SEO sẽ được sử
                                                    dụng trong URL và giúp tối
                                                    ưu cho công cụ tìm kiếm
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlugGenerated(false);
                                            setSlug(e.target.value);
                                        }}
                                        placeholder="duong-dan-seo"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSlugGenerated(true);
                                            if (title) {
                                                const generatedSlug = title
                                                    .toLowerCase()
                                                    .normalize("NFD")
                                                    .replace(
                                                        /[\u0300-\u036f]/g,
                                                        ""
                                                    )
                                                    .replace(/[đĐ]/g, "d")
                                                    .replace(/[^a-z0-9]+/g, "-")
                                                    .replace(/(^-|-$)/g, "");
                                                setSlug(generatedSlug);
                                            }
                                        }}
                                    >
                                        Tạo tự động
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Ví dụ: gioi-thieu-ve-tvuhub
                                </p>
                            </div>

                            {/* Tóm tắt */}
                            <div className="space-y-2">
                                <Label htmlFor="summary">Tóm tắt</Label>
                                <Textarea
                                    id="summary"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                                    rows={3}
                                />
                                <p className="text-xs text-gray-500">
                                    Tóm tắt ngắn gọn nội dung chính của bài
                                    viết, sẽ hiển thị ở trang danh sách
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung bài viết</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                editorClassName="min-h-[400px]"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Phần thông tin phụ */}
                <div className="space-y-6">
                    {/* Cài đặt xuất bản */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt xuất bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Danh mục */}
                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    Danh mục{" "}
                                    <span className="text-red-500">*</span>
                                </Label>

                                {showAddCategory ? (
                                    <div className="space-y-3 p-3 border rounded-md bg-gray-50">
                                        <div className="space-y-1">
                                            <Label htmlFor="new-category-name">
                                                Tên danh mục
                                            </Label>
                                            <Input
                                                id="new-category-name"
                                                value={newCategoryName}
                                                onChange={
                                                    handleCategoryNameChange
                                                }
                                                placeholder="Nhập tên danh mục mới"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="new-category-slug">
                                                Đường dẫn (slug)
                                            </Label>
                                            <Input
                                                id="new-category-slug"
                                                value={newCategorySlug}
                                                onChange={(e) =>
                                                    setNewCategorySlug(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="nhap-duong-dan"
                                            />
                                        </div>

                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setShowAddCategory(false)
                                                }
                                                disabled={addingCategory}
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleAddCategory}
                                                disabled={addingCategory}
                                            >
                                                {addingCategory ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                        Đang thêm...
                                                    </>
                                                ) : (
                                                    "Thêm"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Select
                                            value={categoryId}
                                            onValueChange={setCategoryId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn danh mục" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={
                                                            category.category_id
                                                        }
                                                        value={category.category_id.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                                <div className="px-2 py-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="w-full text-left text-sm flex items-center gap-2 text-blue-600"
                                                        onClick={() =>
                                                            setShowAddCategory(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <span className="font-medium">
                                                            + Thêm danh mục mới
                                                        </span>
                                                    </Button>
                                                </div>
                                            </SelectContent>
                                        </Select>

                                        {categories.length === 0 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2"
                                                onClick={() =>
                                                    setShowAddCategory(true)
                                                }
                                            >
                                                Chưa có danh mục. Thêm mới?
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Trạng thái */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select
                                    value={status}
                                    onValueChange={setStatus}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Bản nháp
                                        </SelectItem>
                                        <SelectItem value="published">
                                            Xuất bản
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Lưu trữ
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tin nổi bật */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_featured"
                                    checked={isFeatured === 1}
                                    onCheckedChange={(checked) => {
                                        setIsFeatured(checked ? 1 : 0);
                                    }}
                                />
                                <Label
                                    htmlFor="is_featured"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Đánh dấu là tin nổi bật
                                </Label>
                            </div>

                            {/* Chỉ hiển thị nội bộ */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_internal"
                                    checked={isInternal === 1}
                                    onCheckedChange={(checked) => {
                                        setIsInternal(checked ? 1 : 0);
                                    }}
                                />
                                <Label
                                    htmlFor="is_internal"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Chỉ hiển thị nội bộ
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ảnh đại diện */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ảnh đại diện</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    ref={fileInputRef}
                                    id="thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                />
                                <p className="text-xs text-gray-500">
                                    Kích thước tối đa: 5MB. Định dạng: JPG, PNG,
                                    GIF, WEBP
                                </p>
                            </div>

                            {thumbnailPreview && (
                                <div className="relative mt-2">
                                    <div className="relative w-full h-40 rounded-md overflow-hidden border">
                                        <Image
                                            src={thumbnailPreview}
                                            alt="Ảnh đại diện"
                                            fill
                                            className="object-cover"
                                            unoptimized={true}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                        onClick={handleClearThumbnail}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Thêm danh mục mới */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Thêm danh mục mới</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="new-category-name"
                                    className="flex-1"
                                >
                                    Tên danh mục
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setShowAddCategory((prev) => !prev)
                                    }
                                >
                                    {showAddCategory ? "Hủy" : "Thêm danh mục"}
                                </Button>
                            </div>

                            {showAddCategory && (
                                <div className="space-y-2">
                                    <Input
                                        id="new-category-name"
                                        value={newCategoryName}
                                        onChange={handleCategoryNameChange}
                                        placeholder="Nhập tên danh mục"
                                    />
                                    <Input
                                        id="new-category-slug"
                                        value={newCategorySlug}
                                        onChange={(e) =>
                                            setNewCategorySlug(e.target.value)
                                        }
                                        placeholder="Nhập slug cho danh mục"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddCategory}
                                        disabled={addingCategory}
                                    >
                                        {addingCategory && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Tạo danh mục
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card> */}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/news")}
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {news ? "Cập nhật" : "Tạo bài viết"}
                </Button>
            </div>
        </form>
    );
}
