import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";

interface EventFilterProps {
    filters: {
        status: string;
        type: string;
        venue: string;
    };
    onChange: (filters: { status: string; type: string; venue: string }) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
}

interface Venue {
    venue_id: number;
    name: string;
}

export default function EventFilter({
    filters,
    onChange,
    sortBy,
    onSortChange,
}: EventFilterProps) {
    const [venues, setVenues] = useState<Venue[]>([]);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetchApi("/venues");
                if (response.ok) {
                    const data = await response.json();
                    setVenues(data);
                }
            } catch (error) {
                console.error("Error fetching venues:", error);
            }
        };

        fetchVenues();
    }, []);

    return (
        <div className="space-y-6">
            {/* Sắp xếp */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Sắp xếp theo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn thứ tự sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="start_date">
                                Ngày diễn ra (gần nhất)
                            </SelectItem>
                            <SelectItem value="-start_date">
                                Ngày diễn ra (xa nhất)
                            </SelectItem>
                            <SelectItem value="popularity">
                                Độ phổ biến
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Trạng thái */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={filters.status}
                        onValueChange={(value) =>
                            onChange({ ...filters, status: value })
                        }
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="status-all" />
                            <Label htmlFor="status-all">Tất cả</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="upcoming"
                                id="status-upcoming"
                            />
                            <Label htmlFor="status-upcoming">Sắp diễn ra</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="ongoing"
                                id="status-ongoing"
                            />
                            <Label htmlFor="status-ongoing">Đang diễn ra</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="completed"
                                id="status-completed"
                            />
                            <Label htmlFor="status-completed">
                                Đã kết thúc
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Loại sự kiện */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Loại sự kiện</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={filters.type}
                        onValueChange={(value) =>
                            onChange({ ...filters, type: value })
                        }
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="type-all" />
                            <Label htmlFor="type-all">Tất cả</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="competition"
                                id="type-competition"
                            />
                            <Label htmlFor="type-competition">Giải đấu</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="training"
                                id="type-training"
                            />
                            <Label htmlFor="type-training">Tập luyện</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="friendly"
                                id="type-friendly"
                            />
                            <Label htmlFor="type-friendly">Giao hữu</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="school_event"
                                id="type-school"
                            />
                            <Label htmlFor="type-school">Sự kiện trường</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="type-other" />
                            <Label htmlFor="type-other">Khác</Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Nhà thi đấu */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Nhà thi đấu</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select
                        value={filters.venue}
                        onValueChange={(value) =>
                            onChange({ ...filters, venue: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà thi đấu" />
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
                </CardContent>
            </Card>
        </div>
    );
}
