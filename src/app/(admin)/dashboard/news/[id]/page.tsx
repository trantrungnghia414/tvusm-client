"use client";

import { use } from "react"; // Thêm import use từ React
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    Eye,
    Calendar,
    User,
    Edit,
    Trash2,
    ArrowLeft,
    ExternalLink,
    Tag,
    // File,
    // Clock,
} from "lucide-react";

import { News } from "../types/newsTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import "@/styles/ckeditor-content.css"; // Thêm import CSS

export default function NewsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Unwrap params để lấy id
    const { id } = use(params);
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchNewsDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/news/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin tin tức");
                }

                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error("Error fetching news:", error);
                toast.error("Không thể tải thông tin tin tức");
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetails();
    }, [id, router]);

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/news/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể xóa tin tức");
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

    const getImageUrl = (path: string | undefined | null): string => {
        if (!path) return "/images/placeholder-news.jpg";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        return `http://localhost:3000${path}?t=${timestamp}`;
    };

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return "-";
        return format(new Date(dateString), "HH:mm 'ngày' dd/MM/yyyy", {
            locale: vi,
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                    >
                        Đã xuất bản
                    </Badge>
                );
            case "draft":
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700"
                    >
                        Bản nháp
                    </Badge>
                );
            case "archived":
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700"
                    >
                        Đã lưu trữ
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="news">
                <LoadingSpinner message="Đang tải thông tin tin tức..." />
            </DashboardLayout>
        );
    }

    if (!news) {
        return (
            <DashboardLayout activeTab="news">
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-red-600">
                        Không tìm thấy tin tức
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Tin tức này không tồn tại hoặc đã bị xóa
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => router.push("/dashboard/news")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
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
                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/news")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/news/${news.slug}`)}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Xem trang public
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                                router.push(
                                    `/dashboard/news/${news.news_id}/edit`
                                )
                            }
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmDeleteOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Title and Status */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(news.status)}
                                            {news.is_featured === 1 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-amber-50 text-amber-600"
                                                >
                                                    Nổi bật
                                                </Badge>
                                            )}
                                            {news.is_internal === 1 && (
                                                <Badge variant="outline">
                                                    Nội bộ
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl text-left">
                                            {news.title}
                                        </CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>
                                            Đăng lúc:{" "}
                                            {formatDate(news.published_at) ||
                                                "Chưa xuất bản"}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        <span>
                                            Tác giả:{" "}
                                            {news.author_name ||
                                                `ID: ${news.author_id}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        <span>
                                            Danh mục:{" "}
                                            {news.category_name ||
                                                `ID: ${news.category_id}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Eye className="h-4 w-4 mr-1" />
                                        <span>Lượt xem: {news.view_count}</span>
                                    </div>
                                </div>

                                {/* Summary */}
                                {news.summary && (
                                    <div className="mt-4 bg-gray-50 p-4 border rounded-md">
                                        <p className="text-gray-700">
                                            {news.summary}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Nội dung
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose max-w-none ck-content"
                                    dangerouslySetInnerHTML={{
                                        __html: news.content,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Featured Image */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Ảnh đại diện
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full h-48 rounded-md overflow-hidden border">
                                    {news.thumbnail ? (
                                        <img
                                            src={getImageUrl(news.thumbnail)}
                                            alt={news.title}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <span className="text-gray-400">
                                                Không có ảnh
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Thông tin khác
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Đường dẫn SEO
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {news.slug}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Trạng thái
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {news.status === "published" &&
                                            "Đã xuất bản"}
                                        {news.status === "draft" && "Bản nháp"}
                                        {news.status === "archived" &&
                                            "Đã lưu trữ"}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Ngày tạo
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {formatDate(news.created_at)}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-medium">
                                        Cập nhật lần cuối
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {formatDate(news.updated_at)}
                                    </p>
                                </div>
                                <Separator />
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/news/${news.news_id}/edit`
                                            )
                                        }
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                            setConfirmDeleteOpen(true)
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
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
                            Bạn có chắc chắn muốn xóa tin tức &quoy;{news.title}
                            &quoy;? Hành động này không thể hoàn tác và tất cả
                            dữ liệu liên quan cũng sẽ bị xóa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
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
