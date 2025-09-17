import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Court } from "../../courts/types/courtTypes";
import { fetchApi } from "@/lib/api";
import { Label } from "@/components/ui/label";

interface CourtMappingFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    parentCourtFilter: string;
    setParentCourtFilter: (courtId: string) => void;
}

export default function CourtMappingFilters({
    searchTerm,
    setSearchTerm,
    parentCourtFilter,
    setParentCourtFilter,
}: CourtMappingFiltersProps) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/courts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    // Chỉ hiển thị sân từ cấp 2 trở lên (sân cha)
                    const parentCourts = data.filter(
                        (court: Court) =>
                            court.court_level && court.court_level >= 2
                    );
                    setCourts(parentCourts);
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border justify-between">
            <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-2.5 top-2.75 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Tìm kiếm ghép sân..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2">
                <Label htmlFor="parent-court-filter">Sân cha</Label>
                <Select
                    value={parentCourtFilter}
                    onValueChange={setParentCourtFilter}
                    disabled={loading}
                >
                    <SelectTrigger
                        className="w-[200px]"
                        id="parent-court-filter"
                    >
                        <SelectValue placeholder="Tất cả sân cha" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả sân cha</SelectItem>
                        {courts.map((court) => (
                            <SelectItem
                                key={court.court_id}
                                value={court.court_id.toString()}
                            >
                                {court.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
