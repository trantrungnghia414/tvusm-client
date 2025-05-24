"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";
import {
    ArrowLeft,
    Edit2,
    Trash2,
    Eye,
    Calendar,
    User,
    Check,
    Clock,
    Archive,
    Star,
    Lock,
    Tag,
    ExternalLink,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "@/app/(admin)/dashboard/components/layout/DashboardLayout";
// import LoadingSpinner from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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

import { News } from "../types/newsTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NewsDetailPage() {
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const params = useParams();
    const router = useRouter();
    const newsId = params.id;

    // Lấy thông tin chi tiết tin tức
    const fetchNewsDetails = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để tiếp tục");
                router.push("/login");
                return;
            }

            // Gọi API lấy chi tiết tin tức
            const response = await fetchApi(`/news/${newsId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    toast.error("Không tìm thấy tin tức");
                    router.push("/dashboard/news");
                    return;
                }
                throw new Error("Không thể tải thông tin tin tức");
            }

            const data = await response.json();
            setNews(data);
        } catch (error) {
            console.error("Error fetching news details:", error);
            toast.error("Không thể tải thông tin tin tức");
            router.push("/dashboard/news");
        } finally {
            setLoading(false);
        }
    }, [newsId, router]);

    useEffect(() => {
        fetchNewsDetails();
    }, [fetchNewsDetails]);

    // Xử lý xóa tin tức
    const handleDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để xóa tin tức
            const response = await fetchApi(`/news/${newsId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa tin tức");
            }

            toast.success("Xóa tin tức thành công");
            router.push("/dashboard/news");
        } catch (error) {
            console.error("Error deleting news:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa tin tức"
            );
        } finally {
            setConfirmDeleteOpen(false);
        }
    };

    // Xử lý thay đổi trạng thái tin tức
    const handleUpdateStatus = async (
        newStatus: "draft" | "published" | "archived"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật trạng thái tin tức
            const response = await fetchApi(`/news/${newsId}/status`, {
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
                    errorData.message || "Không thể cập nhật trạng thái tin tức"
                );
            }

            // Cập nhật state news
            setNews((prev) => (prev ? { ...prev, status: newStatus } : null));
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating news status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái tin tức"
            );
        }
    };

    // Hàm định dạng ngày tháng
    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    // Lấy URL hình ảnh
    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    // Hàm trả về badge dựa trên trạng thái
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        <Check className="mr-1 h-3 w-3" />
                        Đã xuất bản
                    </Badge>
                );
            case "draft":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        Bản nháp
                    </Badge>
                );
            case "archived":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                        <Archive className="mr-1 h-3 w-3" />
                        Đã lưu trữ
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Hiển thị loading nếu đang tải dữ liệu
    if (loading) {
        return (
            <DashboardLayout activeTab="news">
                <LoadingSpinner message="Đang tải thông tin tin tức..." />
            </DashboardLayout>
        );
    }

    // Hiển thị thông báo không tìm thấy tin tức
    if (!news) {
        return (
            <DashboardLayout activeTab="news">
                <div className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-2xl font-bold mb-4">
                        Không tìm thấy tin tức
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tin tức bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
                    </p>
                    <Button onClick={() => router.push("/dashboard/news")}>
                        Quay lại danh sách tin tức
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="news">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/dashboard/news")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold">
                            Chi tiết tin tức
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push(`/dashboard/news/${newsId}/edit`)
                            }
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </Button>
                        <Button
                            variant="default"
                            onClick={() =>
                                window.open(`/news/${news.slug}`, "_blank")
                            }
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem trên trang web
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusBadge(news.status)}
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                            >
                                                <Tag className="mr-1 h-3 w-3" />
                                                {news.category_name ||
                                                    "Chưa phân loại"}
                                            </Badge>
                                            {news.is_featured && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-amber-100 text-amber-800"
                                                >
                                                    <Star className="mr-1 h-3 w-3" />
                                                    Nổi bật
                                                </Badge>
                                            )}
                                            {news.is_internal && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-gray-200 text-gray-800"
                                                >
                                                    <Lock className="mr-1 h-3 w-3" />
                                                    Nội bộ
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl">
                                            {news.title}
                                        </CardTitle>
                                        {news.slug && (
                                            <CardDescription className="mt-1">
                                                Slug: {news.slug}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Thumbnail */}
                                {news.thumbnail && (
                                    <div className="relative h-60 sm:h-80 rounded-md overflow-hidden">
                                        <Image
                                            src={
                                                getImageUrl(news.thumbnail) ||
                                                ""
                                            }
                                            alt={news.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                {/* Summary */}
                                {news.summary && (
                                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                        <h3 className="font-medium mb-2">
                                            Tóm tắt
                                        </h3>
                                        <p>{news.summary}</p>
                                    </div>
                                )}

                                {/* Content */}
                                <div>
                                    <h3 className="font-medium mb-2">
                                        Nội dung
                                    </h3>
                                    <div
                                        className="prose max-w-none border p-4 rounded-md"
                                        dangerouslySetInnerHTML={{
                                            __html: news.content,
                                        }}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex flex-wrap gap-3">
                                {news.status !== "published" && (
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleUpdateStatus("published")
                                        }
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Xuất bản
                                    </Button>
                                )}

                                {news.status !== "draft" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleUpdateStatus("draft")
                                        }
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Đặt thành bản nháp
                                    </Button>
                                )}

                                {news.status !== "archived" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleUpdateStatus("archived")
                                        }
                                    >
                                        <Archive className="mr-2 h-4 w-4" />
                                        Lưu trữ
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Tác giả</p>
                                        <p className="text-gray-600">
                                            {news.author_name ||
                                                "Không có thông tin"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Thời gian</p>
                                        <p className="text-gray-600">
                                            {news.published_at ? (
                                                <>
                                                    <span className="block">
                                                        Xuất bản:{" "}
                                                        {formatDate(
                                                            news.published_at
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                "Chưa xuất bản"
                                            )}
                                            <span className="block">
                                                Tạo:{" "}
                                                {formatDate(news.created_at)}
                                            </span>
                                            <span className="block">
                                                Cập nhật:{" "}
                                                {formatDate(news.updated_at)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Eye className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Lượt xem</p>
                                        <p className="text-gray-600">
                                            {news.view_count} lượt
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <ExternalLink className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Liên kết</p>
                                        <a
                                            href={`/news/${news.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            /news/{news.slug}
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa tin tức
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa tin tức này? Hành động này
                            không thể hoàn tác.
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
