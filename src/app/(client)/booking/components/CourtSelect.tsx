"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api";
import { Court } from "../types/bookingTypes";
import { Search, Map, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CourtSelectProps {
    selectedCourtId: number;
    onCourtSelect: (court: Court | null) => void;
    initialCourtId?: number;
    initialVenueId?: number;
}

export default function CourtSelect({
    selectedCourtId,
    onCourtSelect,
    initialCourtId = 0,
    initialVenueId = 0,
}: CourtSelectProps) {
    const [venues, setVenues] = useState<{ id: number; name: string }[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<number>(initialVenueId);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch venues
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetchApi("/venues");
                if (!response.ok) {
                    throw new Error("Không thể tải danh sách cơ sở");
                }
                const data = await response.json();
                interface VenueData {
                    venue_id: number;
                    name: string;
                }

                setVenues(
                    data.map((venue: VenueData) => ({
                        id: venue.venue_id,
                        name: venue.name,
                    }))
                );
            } catch (error) {
                setError("Không thể tải danh sách cơ sở");
                console.error("Error fetching venues:", error);
            }
        };

        fetchVenues();
    }, []);

    // Fetch courts
    useEffect(() => {
        const fetchCourts = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetchApi("/courts");
                if (!response.ok) {
                    throw new Error("Không thể tải danh sách sân");
                }
                const data = await response.json();

                // Filter out unavailable courts
                const availableCourts = data.filter(
                    (court: Court) => court.status === "available"
                );

                setCourts(availableCourts);
                setFilteredCourts(availableCourts);

                // Handle initial court selection
                if (initialCourtId > 0) {
                    const selectedCourt = availableCourts.find(
                        (court: Court) => court.court_id === initialCourtId
                    );
                    if (selectedCourt) {
                        onCourtSelect(selectedCourt);
                        setSelectedVenue(selectedCourt.venue_id);
                    }
                }
            } catch (error) {
                setError("Không thể tải danh sách sân");
                console.error("Error fetching courts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [initialCourtId, onCourtSelect]);

    // Filter courts when venue or search changes
    useEffect(() => {
        let filtered = [...courts];

        // Filter by venue
        if (selectedVenue > 0) {
            filtered = filtered.filter(
                (court) => court.venue_id === selectedVenue
            );
        }

        // Filter by search term
        if (searchQuery.trim()) {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (court) =>
                    court.name.toLowerCase().includes(searchLower) ||
                    court.type_name.toLowerCase().includes(searchLower) ||
                    court.code.toLowerCase().includes(searchLower)
            );
        }

        setFilteredCourts(filtered);
    }, [courts, selectedVenue, searchQuery]);

    // Handle venue change
    const handleVenueChange = (venueId: string) => {
        const venueIdNum = parseInt(venueId, 10);
        setSelectedVenue(venueIdNum);
        onCourtSelect(null); // Reset selected court when venue changes
    };

    // Handle court selection
    const handleCourtChange = (courtId: string) => {
        const courtIdNum = parseInt(courtId, 10);
        const selectedCourt = courts.find(
            (court) => court.court_id === courtIdNum
        );
        if (selectedCourt) {
            onCourtSelect(selectedCourt);
        }
    };

    return (
        <Card className="border-blue-100">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                    <Map className="h-5 w-5 text-blue-600 mr-2" />
                    Chọn Sân
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Venue select */}
                    <div>
                        <Label htmlFor="venue">Chọn cơ sở</Label>
                        <Select
                            value={selectedVenue.toString()}
                            onValueChange={handleVenueChange}
                        >
                            <SelectTrigger id="venue" className="w-full">
                                <SelectValue placeholder="Chọn cơ sở" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Tất cả cơ sở</SelectItem>
                                {venues.map((venue) => (
                                    <SelectItem
                                        key={venue.id}
                                        value={venue.id.toString()}
                                    >
                                        {venue.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search court */}
                    <div>
                        <Label htmlFor="search-court">Tìm kiếm sân</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="search-court"
                                type="text"
                                placeholder="Tìm theo tên sân hoặc loại sân"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Court select */}
                    <div>
                        <Label htmlFor="court">Chọn sân</Label>
                        <Select
                            value={
                                selectedCourtId
                                    ? selectedCourtId.toString()
                                    : ""
                            }
                            onValueChange={handleCourtChange}
                            disabled={loading}
                        >
                            <SelectTrigger id="court" className="w-full">
                                <SelectValue
                                    placeholder={
                                        loading ? "Đang tải..." : "Chọn sân"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <div className="p-2 text-center">
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent text-blue-600 mr-2"></div>
                                        Đang tải...
                                    </div>
                                ) : filteredCourts.length === 0 ? (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        Không có sân phù hợp
                                    </div>
                                ) : (
                                    filteredCourts.map((court) => (
                                        <SelectItem
                                            key={court.court_id}
                                            value={court.court_id.toString()}
                                        >
                                            {court.name} -{" "}
                                            {court.hourly_rate.toLocaleString(
                                                "vi-VN"
                                            )}
                                            đ/giờ
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected court info */}
                    {selectedCourtId > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="font-medium text-blue-800">
                                Đã chọn:{" "}
                                {
                                    courts.find(
                                        (c) => c.court_id === selectedCourtId
                                    )?.name
                                }
                            </p>
                            <p className="text-blue-700 text-sm mt-1">
                                Cơ sở:{" "}
                                {
                                    courts.find(
                                        (c) => c.court_id === selectedCourtId
                                    )?.venue_name
                                }
                            </p>
                            <p className="text-blue-700 text-sm mt-1">
                                Loại sân:{" "}
                                {
                                    courts.find(
                                        (c) => c.court_id === selectedCourtId
                                    )?.type_name
                                }
                            </p>
                            <p className="text-blue-700 font-medium mt-2">
                                Giá thuê:{" "}
                                {courts
                                    .find((c) => c.court_id === selectedCourtId)
                                    ?.hourly_rate.toLocaleString("vi-VN")}
                                đ/giờ
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
