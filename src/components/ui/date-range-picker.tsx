// client/src/components/ui/date-range-picker.tsx
"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
    // ✅ Sửa lỗi: Cho phép value là undefined
    value?: DateRange | undefined;
    onChange?: (dateRange: DateRange | undefined) => void;
    presets?: Array<{ label: string; value: DateRange }>;
    className?: string;
}

export function DateRangePicker({
    value,
    onChange,
    presets = [],
    className,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (range: DateRange | undefined) => {
        onChange?.(range);
        if (range?.from && range?.to) {
            setOpen(false);
        }
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "dd/MM/yyyy")} -{" "}
                                    {format(value.to, "dd/MM/yyyy")}
                                </>
                            ) : (
                                format(value.from, "dd/MM/yyyy")
                            )
                        ) : (
                            <span>Chọn khoảng thời gian</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        {presets.length > 0 && (
                            <div className="border-r">
                                <div className="p-3">
                                    <p className="text-sm font-medium">
                                        Presets
                                    </p>
                                </div>
                                <div className="space-y-1 p-3 pt-0">
                                    {presets.map((preset) => (
                                        <Button
                                            key={preset.label}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() =>
                                                handleSelect(preset.value)
                                            }
                                        >
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={value?.from}
                            selected={value}
                            onSelect={handleSelect}
                            numberOfMonths={2}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
