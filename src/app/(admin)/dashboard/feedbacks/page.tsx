// trang quản lý phản hồi
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FeedbackStats from "./components/FeedbackStats";
import FeedbackFilters from "./components/FeedbackFilters";
import FeedbackActions from "./components/FeedbackActions";
import FeedbackCard from "./components/FeedbackCard";
import FeedbackTable from "./components/FeedbackTable";
import {
    Feedback,
    FeedbackStats as FeedbackStatsType,
    FeedbackFilters as FilterType,
    VenueOption,
} from "./types/feedback";
import { fetchApi } from "@/lib/api";

export default function FeedbacksPage() {
    const router = useRouter();

    // Data states
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<FeedbackStatsType>({
        total_feedbacks: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        average_rating: 0,
        five_star_count: 0,
        four_star_count: 0,
        three_star_count: 0,
        two_star_count: 0,
        one_star_count: 0,
        this_month_count: 0,
        response_rate: 0,
    });
    const [venues, setVenues] = useState<VenueOption[]>([]);

    // Filter states
    const [filters, setFilters] = useState<FilterType>({
        search: "",
        status: "all",
        rating: "all",
        venue: "all",
        dateFrom: undefined,
        dateTo: undefined,
    });

    // UI states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [selectedFeedbacks, setSelectedFeedbacks] = useState<number[]>([]);

    // Fetch feedbacks data
    const fetchFeedbacks = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/feedbacks", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách phản hồi");
            }

            const data = await response.json();
            setFeedbacks(data);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            toast.error("Không thể tải danh sách phản hồi");
            setFeedbacks([]);
        }
    }, [router]);

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/feedbacks/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching feedback stats:", error);
        }
    }, []);

    // Fetch venues
    const fetchVenues = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/venues", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setVenues(data);
            }
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchFeedbacks(), fetchStats(), fetchVenues()]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchFeedbacks, fetchStats, fetchVenues]);

    // Filter feedbacks
    const filteredFeedbacks = React.useMemo(() => {
        let result = [...feedbacks];

        // Search filter
        if (filters.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(
                (feedback) =>
                    feedback.user?.fullname?.toLowerCase().includes(search) ||
                    feedback.user?.username?.toLowerCase().includes(search) ||
                    feedback.user?.email?.toLowerCase().includes(search) ||
                    feedback.comment.toLowerCase().includes(search) ||
                    feedback.response?.toLowerCase().includes(search)
            );
        }

        // Status filter
        if (filters.status !== "all") {
            result = result.filter(
                (feedback) => feedback.status === filters.status
            );
        }

        // Rating filter
        if (filters.rating !== "all") {
            result = result.filter(
                (feedback) => feedback.rating === parseInt(filters.rating)
            );
        }

        // Venue filter
        if (filters.venue !== "all") {
            result = result.filter(
                (feedback) => feedback.venue_id?.toString() === filters.venue
            );
        }

        // Date filters
        if (filters.dateFrom) {
            result = result.filter(
                (feedback) => new Date(feedback.created_at) >= filters.dateFrom!
            );
        }

        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            dateTo.setHours(23, 59, 59, 999); // End of day
            result = result.filter(
                (feedback) => new Date(feedback.created_at) <= dateTo
            );
        }

        return result;
    }, [feedbacks, filters]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchFeedbacks(), fetchStats()]);
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            rating: "all",
            venue: "all",
            dateFrom: undefined,
            dateTo: undefined,
        });
        toast.success("Đã xóa tất cả bộ lọc");
    };

    // Handle actions
    const handleView = (feedbackId: number) => {
        router.push(`/dashboard/feedbacks/${feedbackId}`);
    };

    const handleEdit = (feedbackId: number) => {
        router.push(`/dashboard/feedbacks/${feedbackId}/edit`);
    };

    const handleUpdateStatus = async (
        feedbackId: number,
        status: Feedback["status"]
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/feedbacks/${feedbackId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            toast.success("Cập nhật trạng thái thành công");
            await fetchFeedbacks();
            await fetchStats();
        } catch (error) {
            console.error("Error updating feedback status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    const handleBulkStatusUpdate = async (
        feedbackIds: number[],
        status: Feedback["status"]
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const updatePromises = feedbackIds.map((id) =>
                fetchApi(`/feedbacks/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                })
            );

            await Promise.all(updatePromises);

            setSelectedFeedbacks([]);
            toast.success(`Đã cập nhật ${feedbackIds.length} phản hồi`);
            await fetchFeedbacks();
            await fetchStats();
        } catch (error) {
            console.error("Error bulk updating feedback status:", error);
            toast.error("Không thể cập nhật trạng thái");
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="feedbacks">
                <LoadingSpinner message="Đang tải danh sách phản hồi..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="feedbacks">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Quản lý phản hồi
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Theo dõi và quản lý tất cả phản hồi từ khách hàng
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <FeedbackStats stats={stats} loading={false} />

                {/* Actions */}
                <FeedbackActions
                    feedbacks={filteredFeedbacks}
                    onRefresh={handleRefresh}
                    onBulkStatusUpdate={handleBulkStatusUpdate}
                    selectedFeedbacks={selectedFeedbacks}
                    loading={refreshing}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {/* Filters */}
                <FeedbackFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    venues={venues}
                    onClearFilters={handleClearFilters}
                />

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        Hiển thị {filteredFeedbacks.length} trên{" "}
                        {feedbacks.length} phản hồi
                    </span>
                    <span>
                        Đánh giá trung bình:{" "}
                        {filteredFeedbacks.length > 0
                            ? (
                                  filteredFeedbacks.reduce(
                                      (sum, feedback) => sum + feedback.rating,
                                      0
                                  ) / filteredFeedbacks.length
                              ).toFixed(1)
                            : "0"}
                        /5
                    </span>
                </div>

                {/* Content */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFeedbacks.map((feedback) => (
                            <FeedbackCard
                                key={feedback.feedback_id}
                                feedback={feedback}
                                onView={handleView}
                                onEdit={handleEdit}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                ) : (
                    <FeedbackTable
                        feedbacks={filteredFeedbacks}
                        onView={handleView}
                        onEdit={handleEdit}
                        onUpdateStatus={handleUpdateStatus}
                        selectedFeedbacks={selectedFeedbacks}
                        onSelectionChange={setSelectedFeedbacks}
                        loading={false}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
