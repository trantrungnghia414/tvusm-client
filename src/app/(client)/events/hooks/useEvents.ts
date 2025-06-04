import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";

interface EventsParams {
    filters: {
        status: string;
        type: string;
        venue: string;
    };
    searchTerm: string;
    sortBy: string;
}

export default function useEvents({
    filters,
    searchTerm,
    sortBy,
}: EventsParams) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Xây dựng query params
            const queryParams = new URLSearchParams();

            // Thêm các bộ lọc
            if (filters.status !== "all") {
                queryParams.append("status", filters.status);
            }

            if (filters.type !== "all") {
                queryParams.append("event_type", filters.type);
            }

            if (filters.venue !== "all") {
                queryParams.append("venue_id", filters.venue);
            }

            // Thêm tìm kiếm
            if (searchTerm) {
                queryParams.append("search", searchTerm);
            }

            // Thêm sắp xếp
            queryParams.append("sort", sortBy);

            // Chỉ lấy sự kiện công khai
            queryParams.append("is_public", "1");

            // Gọi API với các tham số đã xây dựng
            const response = await fetchApi(
                `/events?${queryParams.toString()}`
            );

            if (!response.ok) {
                throw new Error("Không thể tải dữ liệu sự kiện");
            }

            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Đã xảy ra lỗi khi tải dữ liệu sự kiện"
            );
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm, sortBy]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, loading, error };
}
