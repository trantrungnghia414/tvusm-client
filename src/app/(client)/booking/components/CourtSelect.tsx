"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { Court } from "../types/bookingTypes";
import { Search, CheckCircle2, Filter } from "lucide-react";

interface CourtSelectProps {
    selectedCourtId: number;
    onCourtSelect: (court: Court | null) => void;
    initialCourtId?: number;
    initialVenueId?: number;
}

interface CourtType {
    type_id: number;
    name: string;
}

// Interface cho dữ liệu raw từ API
interface ApiCourtData {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    type_name?: string;
    venue_id: number;
    venue_name?: string;
    hourly_rate: number | string;
    status: string;
    image?: string;
    description?: string;
    is_indoor?: boolean | number | string;
    surface_type?: string;
    length?: number;
    width?: number;
    created_at: string;
    updated_at?: string;
    booking_count?: number;
}

export default function CourtSelect({
    selectedCourtId,
    onCourtSelect,
    initialCourtId = 0,
}: CourtSelectProps) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    // Fetch court types
    useEffect(() => {
        const fetchCourtTypes = async () => {
            try {
                const response = await fetchApi("/court-types");
                if (!response.ok) return;
                const data = await response.json();
                setCourtTypes(data);
            } catch (error) {
                console.error("Error fetching court types:", error);
            }
        };

        fetchCourtTypes();
    }, []);

    // Fetch courts
    useEffect(() => {
        const fetchCourts = async () => {
            setLoading(true);

            try {
                const response = await fetchApi("/courts");
                if (!response.ok) return;

                const data: ApiCourtData[] = await response.json();

                // Lọc và chuyển đổi dữ liệu từ API
                const availableCourts: Court[] = data
                    .filter(
                        (court: ApiCourtData) => court.status === "available"
                    )
                    .map(
                        (court: ApiCourtData): Court => ({
                            court_id: court.court_id,
                            name: court.name,
                            code: court.code,
                            type_id: court.type_id,
                            type_name: court.type_name || "Chưa xác định",
                            venue_id: court.venue_id,
                            venue_name: court.venue_name || "Chưa xác định",
                            hourly_rate: Number(court.hourly_rate) || 0,
                            status: court.status as
                                | "available"
                                | "booked"
                                | "maintenance",
                            image: court.image,
                            description: court.description,
                            is_indoor: Boolean(court.is_indoor),
                            surface_type: court.surface_type,
                            length: court.length,
                            width: court.width,
                            created_at: court.created_at,
                            updated_at: court.updated_at,
                            booking_count: court.booking_count,
                        })
                    );

                setCourts(availableCourts);
                setFilteredCourts(availableCourts);

                // Xử lý court đã chọn ban đầu
                if (initialCourtId > 0) {
                    const selectedCourt = availableCourts.find(
                        (court: Court) => court.court_id === initialCourtId
                    );
                    if (selectedCourt) {
                        onCourtSelect(selectedCourt);
                    }
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [initialCourtId, onCourtSelect]);

    // Lọc khi tìm kiếm hoặc thay đổi bộ lọc
    useEffect(() => {
        let filtered = [...courts];

        // Filter by search term
        if (searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (court) =>
                    court.name.toLowerCase().includes(searchLower) ||
                    court.type_name.toLowerCase().includes(searchLower) ||
                    court.code.toLowerCase().includes(searchLower) ||
                    court.venue_name.toLowerCase().includes(searchLower)
            );
        }

        // Filter by court type
        if (selectedTypeFilter !== "all") {
            filtered = filtered.filter(
                (court) => court.type_id.toString() === selectedTypeFilter
            );
        }

        setFilteredCourts(filtered);
    }, [courts, searchQuery, selectedTypeFilter]);

    // Xử lý khi chọn sân
    const handleCourtSelect = (court: Court) => {
        if (selectedCourtId === court.court_id) {
            onCourtSelect(null);
        } else {
            onCourtSelect(court);
        }
    };

    return (
        <div className="space-y-3">
            {/* Compact Search and Filters */}
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sân..."
                            className="pl-8 h-9 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <Select
                        value={selectedTypeFilter}
                        onValueChange={setSelectedTypeFilter}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <div className="flex items-center">
                                <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                <SelectValue placeholder="Loại" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {courtTypes.map((type) => (
                                <SelectItem
                                    key={type.type_id}
                                    value={type.type_id.toString()}
                                >
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Courts Grid - 6 per row, max 18 courts */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {[...Array(18)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded border"></div>
                        </div>
                    ))}
                </div>
            ) : filteredCourts.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">Không tìm thấy sân phù hợp</p>
                </div>
            ) : (
                <div className="max-h-[40vh] overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {filteredCourts.slice(0, 18).map((court) => (
                            <div
                                key={court.court_id}
                                className={`
                                    cursor-pointer transition-all duration-200 
                                    border rounded-lg p-2.5 hover:shadow-sm relative
                                    ${
                                        selectedCourtId === court.court_id
                                            ? "ring-2 ring-blue-500 border-blue-300 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-200 bg-white"
                                    }
                                `}
                                onClick={() => handleCourtSelect(court)}
                            >
                                {/* Selected indicator */}
                                {selectedCourtId === court.court_id && (
                                    <div className="absolute top-1.5 right-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    {/* Court name */}
                                    <h4 className="font-medium text-xs text-gray-900 leading-tight pr-5 line-clamp-2">
                                        {court.name}
                                    </h4>

                                    {/* Court code */}
                                    <p className="text-xs text-blue-600 font-mono">
                                        {court.code}
                                    </p>

                                    {/* Court type */}
                                    <p className="text-xs text-gray-500">
                                        {court.type_name}
                                    </p>

                                    {/* Price */}
                                    <div className="text-xs font-medium text-green-600">
                                        {court.hourly_rate.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ/h
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results count */}
            <div className="text-xs text-gray-500 text-center">
                {Math.min(filteredCourts.length, 18)} / {filteredCourts.length}{" "}
                sân có sẵn
            </div>
        </div>
    );
}
