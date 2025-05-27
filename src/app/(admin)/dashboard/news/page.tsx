"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "../../components/layout/DashboardLayout";
// import NewsTable from "./components/NewsTable";
// import NewsActions from "./components/NewsActions";
// import NewsFilters from "./components/NewsFilters";
// import NewsStats from "./components/NewsStats";
// import LoadingSpinner from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { News, NewsStats as NewsStatsType } from "./types/newsTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import NewsActions from "@/app/(admin)/dashboard/news/components/NewsActions";
import NewsStats from "@/app/(admin)/dashboard/news/components/NewsStats";
import NewsFilters from "@/app/(admin)/dashboard/news/components/NewsFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import NewsTable from "@/app/(admin)/dashboard/news/components/NewsTable";

export default function NewsPage() {
    const router = useRouter();
    const [news, setNews] = useState<News[]>([]);
    const [filteredNews, setFilteredNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stats, setStats] = useState<NewsStatsType>({
        totalNews: 0,
        publishedNews: 0,
        draftNews: 0,
        archivedNews: 0,
        featuredNews: 0,
    });

    // Xác nhận xóa
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<number | null>(null);

    // Fetch tin tức
    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/news", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách tin tức");
            }

            const data = await response.json();
            setNews(data);
            setFilteredNews(data);

            // Tính toán thống kê
            const statsData: NewsStatsType = {
                totalNews: data.length,
                publishedNews: data.filter(
                    (item: News) => item.status === "published"
                ).length,
                draftNews: data.filter((item: News) => item.status === "draft")
                    .length,
                archivedNews: data.filter(
                    (item: News) => item.status === "archived"
                ).length,
                featuredNews: data.filter(
                    (item: News) => item.is_featured === 1
                ).length,
            };

            // Tìm tin tức có lượt xem cao nhất
            if (data.length > 0) {
                const mostViewed = [...data].sort(
                    (a, b) => b.view_count - a.view_count
                )[0];
                statsData.mostViewedNews = {
                    title: mostViewed.title,
                    views: mostViewed.view_count,
                };
            }

            setStats(statsData);
        } catch (error) {
            console.error("Error fetching news:", error);
            toast.error("Không thể tải danh sách tin tức");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Lọc tin tức
    const filterNews = useCallback(() => {
        let result = [...news];

        // Lọc theo từ khóa
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchLower) ||
                    item.summary?.toLowerCase().includes(searchLower)
            );
        }

        // Lọc theo danh mục
        if (categoryFilter !== "all") {
            result = result.filter(
                (item) => item.category_id.toString() === categoryFilter
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((item) => item.status === statusFilter);
        }

        setFilteredNews(result);
    }, [news, searchTerm, categoryFilter, statusFilter]);

    // Xử lý xóa tin tức
    const handleDeleteClick = (newsId: number) => {
        setNewsToDelete(newsId);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!newsToDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/news/${newsToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa tin tức");
            }

            setNews(news.filter((item) => item.news_id !== newsToDelete));
            toast.success("Xóa tin tức thành công");
        } catch (error) {
            console.error("Error deleting news:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa tin tức"
            );
        } finally {
            setConfirmDeleteOpen(false);
            setNewsToDelete(null);
        }
    };

    // Điều hướng đến trang thêm tin tức
    const handleAddNews = () => {
        router.push("/dashboard/news/add");
    };

    // Điều hướng đến trang chỉnh sửa tin tức
    const handleEditNews = (newsId: number) => {
        router.push(`/dashboard/news/${newsId}/edit`);
    };

    // Điều hướng đến trang xem tin tức
    const handleViewNews = (newsId: number) => {
        router.push(`/dashboard/news/${newsId}`);
    };

    // Cập nhật trạng thái tin tức
    const handleUpdateStatus = async (newsId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/news/${newsId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            // Cập nhật state
            setNews(
                news.map((item) =>
                    item.news_id === newsId
                        ? {
                              ...item,
                              status: newStatus as
                                  | "draft"
                                  | "published"
                                  | "archived",
                          }
                        : item
                )
            );

            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating news status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    // Lọc dữ liệu khi các filter thay đổi
    useEffect(() => {
        filterNews();
    }, [filterNews]);

    return (
        <DashboardLayout activeTab="news">
            <div className="space-y-6">
                {/* Tiêu đề và nút thêm mới */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý tin tức</h1>
                    <NewsActions
                        onAddNews={handleAddNews}
                        news={filteredNews}
                    />
                </div>

                {/* Thống kê nhanh */}
                <NewsStats stats={stats} />

                <Separator />

                {/* Bộ lọc */}
                <NewsFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Bảng danh sách */}
                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách tin tức..." />
                ) : (
                    <NewsTable
                        news={filteredNews}
                        onDelete={handleDeleteClick}
                        onEdit={handleEditNews}
                        onView={handleViewNews}
                        onUpdateStatus={handleUpdateStatus}
                        confirmDeleteOpen={confirmDeleteOpen}
                        setConfirmDeleteOpen={setConfirmDeleteOpen}
                        confirmDelete={confirmDelete}
                    />
                )}

                {/* Dialog xác nhận xóa */}
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
                                Bạn có chắc chắn muốn xóa tin tức này? Hành động
                                này không thể hoàn tác và tất cả dữ liệu liên
                                quan cũng sẽ bị xóa.
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
            </div>
        </DashboardLayout>
    );
}
