"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "../../components/layout/DashboardLayout";
// import EventTable from "./components/EventTable";
// import EventFilters from "./components/EventFilters";
// import EventActions from "./components/EventActions";
// import EventStats from "./components/EventStats";
// import LoadingSpinner from "@/components/ui/loading-spinner";

import { Event, EventStats as EventStatsType } from "./types/eventTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import EventActions from "@/app/(admin)/dashboard/events/components/EventActions";
import EventStats from "@/app/(admin)/dashboard/events/components/EventStats";
import EventFilters from "@/app/(admin)/dashboard/events/components/EventFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EventTable from "@/app/(admin)/dashboard/events/components/EventTable";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [eventToDelete, setEventToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [venueFilter, setVenueFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [stats, setStats] = useState<EventStatsType>({
        totalEvents: 0,
        upcomingEvents: 0,
        ongoingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        featuredEvents: 0,
    });

    const router = useRouter();

    // Fetch danh sách sự kiện
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/events", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách sự kiện");
            }

            const data = await response.json();
            setEvents(data);

            // Tính toán thống kê
            const stats: EventStatsType = {
                totalEvents: data.length,
                upcomingEvents: data.filter(
                    (event: Event) => event.status === "upcoming"
                ).length,
                ongoingEvents: data.filter(
                    (event: Event) => event.status === "ongoing"
                ).length,
                completedEvents: data.filter(
                    (event: Event) => event.status === "completed"
                ).length,
                cancelledEvents: data.filter(
                    (event: Event) => event.status === "cancelled"
                ).length,
                featuredEvents: data.filter((event: Event) => event.is_featured)
                    .length,
            };

            // Tìm sự kiện phổ biến nhất
            if (data.length > 0) {
                const mostPopular = [...data].sort(
                    (a, b) => b.current_participants - a.current_participants
                )[0];

                stats.mostPopularEvent = {
                    title: mostPopular.title,
                    participants: mostPopular.current_participants,
                };
            }

            setStats(stats);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Đã xảy ra lỗi khi tải danh sách sự kiện");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Lọc sự kiện theo bộ lọc
    const filterEvents = useCallback(() => {
        let result = [...events];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (event) =>
                    event.title.toLowerCase().includes(searchLower) ||
                    (event.description?.toLowerCase() || "").includes(
                        searchLower
                    )
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((event) => event.status === statusFilter);
        }

        // Lọc theo loại sự kiện
        if (typeFilter !== "all") {
            result = result.filter((event) => event.event_type === typeFilter);
        }

        // Lọc theo địa điểm
        if (venueFilter !== "all") {
            result = result.filter(
                (event) =>
                    event.venue_id !== undefined &&
                    event.venue_id.toString() === venueFilter
            );
        }

        // Lọc theo thời gian
        if (dateFilter !== "all") {
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            const nextMonth = new Date();
            nextMonth.setMonth(today.getMonth() + 1);

            const todayStr = today.toISOString().split("T")[0];
            const nextWeekStr = nextWeek.toISOString().split("T")[0];
            const nextMonthStr = nextMonth.toISOString().split("T")[0];

            switch (dateFilter) {
                case "today":
                    result = result.filter(
                        (event) => event.start_date === todayStr
                    );
                    break;
                case "this_week":
                    result = result.filter(
                        (event) =>
                            event.start_date >= todayStr &&
                            event.start_date <= nextWeekStr
                    );
                    break;
                case "this_month":
                    result = result.filter(
                        (event) =>
                            event.start_date >= todayStr &&
                            event.start_date <= nextMonthStr
                    );
                    break;
                case "past":
                    result = result.filter(
                        (event) => event.start_date < todayStr
                    );
                    break;
                case "future":
                    result = result.filter(
                        (event) => event.start_date >= todayStr
                    );
                    break;
            }
        }

        setFilteredEvents(result);
    }, [events, searchTerm, statusFilter, typeFilter, venueFilter, dateFilter]);

    // Fetch sự kiện khi component mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Lọc sự kiện khi filters thay đổi
    useEffect(() => {
        filterEvents();
    }, [filterEvents]);

    // Xử lý xóa sự kiện
    const handleDeleteEvent = (eventId: number) => {
        setEventToDelete(eventId);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để xóa sự kiện
            const response = await fetchApi(`/events/${eventToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể xóa sự kiện");
            }

            // Cập nhật danh sách sau khi xóa
            setEvents(
                events.filter((event) => event.event_id !== eventToDelete)
            );
            toast.success("Xóa sự kiện thành công");
            setConfirmDeleteOpen(false);
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể xóa sự kiện"
            );
        }
    };

    // Xử lý thay đổi trạng thái sự kiện
    const handleUpdateStatus = async (
        eventId: number,
        newStatus: "upcoming" | "ongoing" | "completed" | "cancelled"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật trạng thái sự kiện
            const response = await fetchApi(`/events/${eventId}`, {
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
                    errorData.message || "Không thể cập nhật trạng thái sự kiện"
                );
            }

            // Cập nhật danh sách sau khi cập nhật trạng thái
            setEvents(
                events.map((event) =>
                    event.event_id === eventId
                        ? { ...event, status: newStatus }
                        : event
                )
            );
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating event status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái sự kiện"
            );
        }
    };

    // Điều hướng đến trang thêm sự kiện
    const handleAddEvent = () => {
        router.push("/dashboard/events/add");
    };

    // Điều hướng đến trang chi tiết sự kiện
    const handleViewEvent = (eventId: number) => {
        router.push(`/dashboard/events/${eventId}`);
    };

    // Điều hướng đến trang chỉnh sửa sự kiện
    const handleEditEvent = (eventId: number) => {
        router.push(`/dashboard/events/${eventId}/edit`);
    };

    return (
        <DashboardLayout activeTab="events">
            <div className="space-y-6">
                {/* Tiêu đề và nút thêm mới */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Quản lý sự kiện</h1>
                    <EventActions
                        onAddEvent={handleAddEvent}
                        events={filteredEvents}
                    />
                </div>

                {/* Thống kê sự kiện */}
                <EventStats stats={stats} />

                {/* Bộ lọc */}
                <EventFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    venueFilter={venueFilter}
                    setVenueFilter={setVenueFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />

                {/* Bảng danh sách sự kiện */}
                {loading ? (
                    <LoadingSpinner message="Đang tải danh sách sự kiện..." />
                ) : (
                    <EventTable
                        events={filteredEvents}
                        onDelete={handleDeleteEvent}
                        onView={handleViewEvent}
                        onEdit={handleEditEvent}
                        onUpdateStatus={handleUpdateStatus}
                        confirmDeleteOpen={confirmDeleteOpen}
                        setConfirmDeleteOpen={setConfirmDeleteOpen}
                        confirmDelete={confirmDelete}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
