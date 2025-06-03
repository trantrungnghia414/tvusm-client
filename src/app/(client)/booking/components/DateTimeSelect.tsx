"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchApi } from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    format,
    addDays,
    parse,
    addHours,
    isBefore,
    startOfHour,
    isAfter,
} from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, Clock, Loader2 } from "lucide-react";

interface TimeSlot {
    id: string;
    start: string;
    end: string;
    available: boolean;
}

interface ApiTimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

export interface DateTimeValue {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
}

interface DateTimeSelectProps {
    value: DateTimeValue;
    onChange: (value: DateTimeValue) => void;
    courtId: number;
}

export default function DateTimeSelect({
    value,
    onChange,
    courtId,
}: DateTimeSelectProps) {
    const [date, setDate] = useState<Date | undefined>(
        value.date ? parse(value.date, "yyyy-MM-dd", new Date()) : undefined
    );
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate default time slots
    const generateDefaultTimeSlots = useCallback(() => {
        const slots: TimeSlot[] = [];
        const now = new Date();
        const currentHour = now.getHours();
        const isToday =
            date &&
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        // Opening hours
        const openingHour = 6; // 6:00 AM
        const closingHour = 22; // 10:00 PM

        for (let hour = openingHour; hour < closingHour; hour++) {
            // Skip past hours for today
            let available = true;
            if (isToday && hour <= currentHour) {
                available = false;
            }

            const start = `${hour.toString().padStart(2, "0")}:00`;
            const end = `${(hour + 1).toString().padStart(2, "0")}:00`;

            // Random availability for demo
            if (available) {
                available = Math.random() > 0.3; // 70% chance to be available
            }

            slots.push({
                id: `slot-${hour}`,
                start,
                end,
                available,
            });
        }

        setTimeSlots(slots);
    }, [date]);

    // Fetch available time slots
    const fetchTimeSlots = useCallback(async () => {
        if (!date || !courtId) return;

        setLoading(true);
        setError(null);

        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const response = await fetchApi(
                `/courts/${courtId}/availability?date=${formattedDate}`
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.slots && data.slots.length > 0) {
                    // Process API data
                    const formattedSlots = data.slots.map(
                        (slot: ApiTimeSlot) => ({
                            id: `slot-${slot.start_time}`,
                            start: slot.start_time,
                            end: slot.end_time,
                            available: slot.is_available,
                        })
                    );

                    setTimeSlots(formattedSlots);
                } else {
                    // Generate default slots if API returns no data
                    generateDefaultTimeSlots();
                }
            } else {
                // Generate default slots if API is not available
                generateDefaultTimeSlots();
            }
        } catch (error) {
            setError("Không thể tải danh sách khung giờ");
            console.error("Error fetching time slots:", error);

            // Generate default slots on error
            generateDefaultTimeSlots();
        } finally {
            setLoading(false);
        }
    }, [date, courtId, generateDefaultTimeSlots]);

    // Handle date change
    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);

            // Update date in form
            const dateStr = format(newDate, "yyyy-MM-dd");

            // Reset start_time and end_time when date changes
            onChange({
                date: dateStr,
                startTime: "",
                endTime: "",
                duration: value.duration,
            });
        }
    };

    // Handle start time selection
    const handleStartTimeChange = (startTime: string) => {
        if (!startTime) {
            onChange({
                ...value,
                startTime: "",
                endTime: "",
                duration: value.duration,
            });
            return;
        }

        // Check if there are enough consecutive slots
        const consecutiveCount = getConsecutiveSlots(startTime, value.duration);

        if (consecutiveCount >= value.duration) {
            // Calculate end time
            const [hours, minutes] = startTime.split(":").map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = addHours(startDate, value.duration);
            const endTime = format(endDate, "HH:mm");

            onChange({
                ...value,
                startTime,
                endTime,
            });
        } else {
            // Not enough consecutive slots
            onChange({
                ...value,
                startTime,
                endTime: "",
            });
            setError(
                `Không đủ ${value.duration} giờ liên tiếp từ ${startTime}`
            );
        }
    };

    // Handle duration change
    const handleDurationChange = (duration: string) => {
        const newDuration = parseInt(duration, 10);

        // If start time is selected, check if there are enough consecutive slots
        if (value.startTime) {
            const consecutiveCount = getConsecutiveSlots(
                value.startTime,
                newDuration
            );

            if (consecutiveCount >= newDuration) {
                // Calculate new end time
                const [hours, minutes] = value.startTime.split(":").map(Number);
                const startDate = new Date();
                startDate.setHours(hours, minutes, 0, 0);
                const endDate = addHours(startDate, newDuration);
                const endTime = format(endDate, "HH:mm");

                onChange({
                    ...value,
                    endTime,
                    duration: newDuration,
                });
            } else {
                // Not enough consecutive slots, reset start time
                onChange({
                    ...value,
                    startTime: "",
                    endTime: "",
                    duration: newDuration,
                });
                setError(
                    `Không thể đặt ${newDuration} giờ liên tiếp từ giờ bắt đầu đã chọn.`
                );
            }
        } else {
            // If no start time is selected, just update duration
            onChange({
                ...value,
                duration: newDuration,
            });
        }
    };

    // Check if there are enough consecutive available slots
    const getConsecutiveSlots = (
        startTime: string,
        hoursNeeded: number
    ): number => {
        const startIndex = timeSlots.findIndex(
            (slot) => slot.start === startTime
        );
        if (startIndex === -1) return 0;

        let consecutive = 1;
        for (let i = startIndex + 1; i < timeSlots.length; i++) {
            if (timeSlots[i].available) {
                consecutive++;
                if (consecutive >= hoursNeeded) {
                    return consecutive;
                }
            } else {
                break;
            }
        }

        return consecutive;
    };

    // Filter available start times
    const availableStartTimes = timeSlots.filter((slot) => slot.available);

    // Duration options
    const durationOptions = [1, 2, 3, 4];

    // Fetch time slots when court or date changes
    useEffect(() => {
        if (courtId && date) {
            fetchTimeSlots();
        }
    }, [courtId, date, fetchTimeSlots]);

    return (
        <Card className="border-blue-100">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Chọn Ngày & Giờ
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Date selection */}
                    <div>
                        <Label className="mb-2 block">Ngày đặt sân</Label>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateChange}
                            locale={vi}
                            disabled={(date) => {
                                // Disable past dates
                                return (
                                    isBefore(date, startOfHour(new Date())) ||
                                    isAfter(date, addDays(new Date(), 30))
                                ); // Allow booking up to 30 days ahead
                            }}
                            className="border rounded-md bg-white"
                        />
                    </div>

                    {/* Error alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Start time selection */}
                    <div>
                        <Label className="mb-2 block">Giờ bắt đầu</Label>
                        <Select
                            value={value.startTime}
                            onValueChange={handleStartTimeChange}
                            disabled={loading || courtId === 0}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        loading
                                            ? "Đang tải..."
                                            : courtId === 0
                                            ? "Vui lòng chọn sân trước"
                                            : "Chọn giờ bắt đầu"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span>Đang tải...</span>
                                    </div>
                                ) : availableStartTimes.length > 0 ? (
                                    availableStartTimes.map((slot) => (
                                        <SelectItem
                                            key={slot.id}
                                            value={slot.start}
                                        >
                                            {slot.start} - {slot.end}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                        Không có khung giờ nào khả dụng
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration selection */}
                    <div>
                        <Label className="mb-2 block">Thời lượng</Label>
                        <Select
                            value={value.duration.toString()}
                            onValueChange={handleDurationChange}
                            disabled={!date || courtId === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn thời lượng" />
                            </SelectTrigger>
                            <SelectContent>
                                {durationOptions.map((duration) => (
                                    <SelectItem
                                        key={duration}
                                        value={duration.toString()}
                                    >
                                        {duration} giờ
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Display selected time */}
                    {value.startTime && value.endTime && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="font-medium text-blue-800">
                                Thời gian đã chọn: {value.startTime} -{" "}
                                {value.endTime}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
