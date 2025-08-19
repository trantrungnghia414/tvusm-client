import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { CourtType, Venue } from "../types/courtTypes";
import { Search } from "lucide-react";

interface CourtFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    venueFilter: string;
    setVenueFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
}

export default function CourtFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    venueFilter,
    setVenueFilter,
    typeFilter,
    setTypeFilter,
}: CourtFiltersProps) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);

    useEffect(() => {
        // Lấy danh sách nhà thi đấu và loại sân
        const fetchVenuesAndTypes = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Lấy danh sách nhà thi đấu
                const venuesResponse = await fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (venuesResponse.ok) {
                    const venuesData = await venuesResponse.json();
                    setVenues(venuesData);
                }

                // Lấy danh sách loại sân
                const typesResponse = await fetchApi("/court-types", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (typesResponse.ok) {
                    const typesData = await typesResponse.json();
                    setCourtTypes(typesData);
                }
            } catch (error) {
                console.error("Error fetching filter data:", error);
            }
        };

        fetchVenuesAndTypes();
    }, []);

    return (
        <div className="flex justify-between bg-white p-4 rounded-lg border">
            <div className="relative w-full flex-1 max-w-[400px]">
                <Search className="absolute left-2.5 top-2.75 h-4 w-4 text-gray-500" />
                <Input
                    id="search"
                    placeholder="Tìm kiếm theo tên, mã sân..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-8"
                />
            </div>

            <div className="flex items-center gap-8">
                {/* <div className="w-full sm:w-[180px]"> */}
                <div className="flex items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger id="status" className="h-9">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="available">
                                Sẵn sàng sử dụng
                            </SelectItem>
                            {/* <SelectItem value="booked">Đã đặt</SelectItem> */}
                            <SelectItem value="maintenance">
                                Đang bảo trì
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* <div className="w-full sm:w-[200px]"> */}
                <div className="flex items-center gap-2">
                    <Select value={venueFilter} onValueChange={setVenueFilter}>
                        <SelectTrigger id="venue" className="h-9">
                            <SelectValue placeholder="Nhà thi đấu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả nhà thi đấu
                            </SelectItem>
                            {venues.map((venue) => (
                                <SelectItem
                                    key={venue.venue_id}
                                    value={venue.venue_id.toString()}
                                >
                                    {venue.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* <div className="w-full sm:w-[180px]"> */}
                <div className="flex items-center gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger id="type" className="h-9">
                            <SelectValue placeholder="Loại sân" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại sân</SelectItem>
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
        </div>
    );
}
