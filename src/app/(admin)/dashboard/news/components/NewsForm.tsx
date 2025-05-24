"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import { Calendar as CalendarIcon, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import Editor from "./Editor";
import { News, NewsCategory } from "../types/newsTypes";

interface NewsFormProps {
    news?: News;
    onSubmit: (formData: FormData) => void;
    isSubmitting?: boolean;
}

// Định nghĩa schema cho form
const formSchema = z.object({
    title: z.string().min(5, {
        message: "Tiêu đề phải có ít nhất 5 ký tự.",
    }),
    slug: z.string().optional(),
    content: z.string().min(10, {
        message: "Nội dung phải có ít nhất 10 ký tự.",
    }),
    summary: z.string().optional(),
    categoryId: z.string().min(1, {
        message: "Vui lòng chọn danh mục.",
    }),
    status: z.enum(["draft", "published", "archived"]),
    isFeatured: z.boolean().default(false),
    isInternal: z.boolean().default(false),
    publishedAt: z.date().nullable().optional(),
});

export default function NewsForm({
    news,
    onSubmit,
    isSubmitting = false,
}: NewsFormProps) {
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        news?.thumbnail || null
    );
    const router = useRouter();

    // Khởi tạo form với React Hook Form và Zod
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: news?.title || "",
            slug: news?.slug || "",
            content: news?.content || "",
            summary: news?.summary || "",
            categoryId: news?.category_id.toString() || "",
            status: news?.status || "draft",
            isFeatured: news?.is_featured || false,
            isInternal: news?.is_internal || false,
            publishedAt: news?.published_at
                ? new Date(news.published_at)
                : null,
        },
    });

    // Lấy danh sách danh mục
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi("/news/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                } else {
                    throw new Error("Không thể tải danh sách danh mục");
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Không thể tải danh sách danh mục");
            }
        };

        fetchCategories();
    }, [router]);

    // Xử lý khi chọn file ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Kiểm tra kích thước file (tối đa 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 5MB");
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
                    "Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP hoặc GIF"
                );
                return;
            }

            setSelectedImage(file);

            // Tạo URL để xem trước ảnh
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                if (e.target?.result) {
                    setPreviewUrl(e.target.result.toString());
                }
            };
            fileReader.readAsDataURL(file);
        }
    };

    // Xử lý khi xóa ảnh
    const handleRemoveImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
    };

    // Xử lý khi nộp form
    const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
        const formData = new FormData();

        // Thêm các giá trị từ form vào FormData
        formData.append("title", values.title);
        formData.append("content", values.content);
        formData.append("categoryId", values.categoryId);
        formData.append("status", values.status);

        if (values.slug) formData.append("slug", values.slug);
        if (values.summary) formData.append("summary", values.summary);
        formData.append("isFeatured", values.isFeatured ? "true" : "false");
        formData.append("isInternal", values.isInternal ? "true" : "false");

        if (values.publishedAt) {
            formData.append(
                "publishedAt",
                format(values.publishedAt, "yyyy-MM-dd'T'HH:mm:ss")
            );
        }

        // Xử lý ảnh
        if (selectedImage) {
            formData.append("thumbnail", selectedImage);
        } else if (news?.thumbnail && !previewUrl) {
            // Ảnh đã bị xóa
            formData.append("thumbnail", "");
        }

        onSubmit(formData);
    };

    // Lấy URL hình ảnh
    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-8 bg-white p-6 rounded-lg shadow-sm"
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Cột trái - thông tin chính */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Tiêu đề */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Tiêu đề{" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập tiêu đề tin tức"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Slug */}
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Để trống để tạo tự động"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Định dạng URL của tin tức, ví dụ:
                                        tin-tuc-moi
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tóm tắt */}
                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tóm tắt</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Tóm tắt ngắn gọn về tin tức"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Nội dung */}
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nội dung{" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Editor
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Nhập nội dung tin tức"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Cột phải - thông tin phụ */}
                    <div className="space-y-6">
                        {/* Ảnh đại diện */}
                        <div className="space-y-2">
                            <Label>Ảnh đại diện</Label>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Input
                                        id="thumbnail"
                                        name="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            document
                                                .getElementById("thumbnail")
                                                ?.click()
                                        }
                                        className="w-full"
                                    >
                                        <ImageIcon className="mr-2 h-4 w-4" />
                                        {selectedImage
                                            ? selectedImage.name
                                            : previewUrl
                                            ? "Thay đổi ảnh"
                                            : "Chọn ảnh"}
                                    </Button>

                                    {(previewUrl || selectedImage) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveImage}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {previewUrl && (
                                    <div className="relative h-40 rounded-md overflow-hidden border">
                                        <Image
                                            src={
                                                selectedImage
                                                    ? previewUrl
                                                    : getImageUrl(previewUrl) ||
                                                      ""
                                            }
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Danh mục */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Danh mục{" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn danh mục" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.category_id}
                                                    value={category.category_id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Trạng thái */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Trạng thái{" "}
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn trạng thái" />
                                            </SelectTrigger>
                                        </FormControl>
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Ngày xuất bản */}
                        <FormField
                            control={form.control}
                            name="publishedAt"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Ngày xuất bản</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? format(
                                                              field.value,
                                                              "dd/MM/yyyy"
                                                          )
                                                        : "Chọn ngày"}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    field.value || undefined
                                                }
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date <
                                                    new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Nếu không chọn và trạng thái là "Xuất
                                        bản", tin tức sẽ được xuất bản ngay.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tin nổi bật */}
                        <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Tin nổi bật</FormLabel>
                                        <FormDescription>
                                            Đánh dấu tin này là nổi bật để hiển
                                            thị trên trang chủ
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Tin nội bộ */}
                        <FormField
                            control={form.control}
                            name="isInternal"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Tin nội bộ</FormLabel>
                                        <FormDescription>
                                            Chỉ hiển thị cho nhân viên và quản
                                            trị viên
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/news")}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Đang lưu..."
                            : news
                            ? "Cập nhật"
                            : "Tạo tin tức"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
