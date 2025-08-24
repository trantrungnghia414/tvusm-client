"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LocationPoint {
    id: string;
    name: string;
    x: number; // Tọa độ X (phần trăm)
    y: number; // Tọa độ Y (phần trăm)
    zone: "goal" | "penalty" | "center" | "corner" | "side" | "equipment";
}

interface LocationPickerProps {
    selectedLocation?: string;
    onLocationSelect: (locationId: string, locationName: string) => void;
    courtType?:
        | "football"
        | "basketball"
        | "tennis"
        | "volleyball"
        | "badminton"
        | "pickleball"
        | "general";
    className?: string;
    locationNote?: string;
    onLocationNoteChange?: (note: string) => void;
    courtCode?: string;
}

// Định nghĩa các vị trí cho từng loại sân
const COURT_LOCATIONS: Record<string, LocationPoint[]> = {
    football: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 15, y: 4, zone: "center" },
        { id: "three", name: "3", x: 32, y: 4, zone: "center" },
        { id: "four", name: "4", x: 34, y: 4, zone: "center" },
        { id: "five", name: "5", x: 50, y: 4, zone: "center" },
        { id: "six", name: "6", x: 65, y: 4, zone: "center" },
        { id: "seven", name: "7", x: 67, y: 4, zone: "center" },
        { id: "eight", name: "8", x: 85, y: 4, zone: "center" },
        { id: "nine", name: "9", x: 98, y: 4, zone: "center" },
        { id: "ten", name: "10", x: 98, y: 50, zone: "center" },
        { id: "eleven", name: "11", x: 98, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 85, y: 96, zone: "center" },
        { id: "thirteen", name: "13", x: 67, y: 96, zone: "center" },
        { id: "fourteen", name: "14", x: 65, y: 96, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 96, zone: "center" },
        { id: "sixteen", name: "16", x: 34, y: 96, zone: "center" },
        { id: "seventeen", name: "17", x: 32, y: 96, zone: "center" },
        { id: "eighteen", name: "18", x: 15, y: 96, zone: "center" },
        { id: "nineteen", name: "19", x: 2, y: 96, zone: "center" },
        { id: "twenty", name: "20", x: 2, y: 50, zone: "center" },
        { id: "twentyone", name: "21", x: 15, y: 50, zone: "center" },
        { id: "twentytwo", name: "22", x: 33, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 50, y: 50, zone: "center" },
        { id: "twentyfour", name: "24", x: 66, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 85, y: 50, zone: "center" },
    ],
    basketball: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 25, y: 4, zone: "center" },
        { id: "three", name: "3", x: 50, y: 4, zone: "center" },
        { id: "four", name: "4", x: 75, y: 4, zone: "center" },
        { id: "five", name: "5", x: 98, y: 4, zone: "center" },
        { id: "six", name: "6", x: 98, y: 50, zone: "center" },
        { id: "seven", name: "7", x: 98, y: 96, zone: "center" },
        { id: "eight", name: "8", x: 75, y: 96, zone: "center" },
        { id: "nine", name: "9", x: 50, y: 96, zone: "center" },
        { id: "ten", name: "10", x: 25, y: 96, zone: "center" },
        { id: "eleven", name: "11", x: 2, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 2, y: 50, zone: "center" },
        { id: "thirteen", name: "13", x: 15, y: 50, zone: "center" },
        { id: "fourteen", name: "14", x: 33, y: 50, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 50, zone: "center" },
        { id: "sixteen", name: "16", x: 66, y: 50, zone: "center" },
        { id: "seventeen", name: "17", x: 85, y: 50, zone: "center" },
    ],
    tennis: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 25, y: 4, zone: "center" },
        { id: "three", name: "3", x: 50, y: 4, zone: "center" },
        { id: "four", name: "4", x: 75, y: 4, zone: "center" },
        { id: "five", name: "5", x: 98, y: 4, zone: "center" },
        { id: "six", name: "6", x: 98, y: 50, zone: "center" },
        { id: "seven", name: "7", x: 98, y: 96, zone: "center" },
        { id: "eight", name: "8", x: 75, y: 96, zone: "center" },
        { id: "nine", name: "9", x: 50, y: 96, zone: "center" },
        { id: "ten", name: "10", x: 25, y: 96, zone: "center" },
        { id: "eleven", name: "11", x: 2, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 2, y: 50, zone: "center" },
        { id: "thirteen", name: "13", x: 15, y: 50, zone: "center" },
        { id: "fourteen", name: "14", x: 33, y: 50, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 50, zone: "center" },
        { id: "sixteen", name: "16", x: 66, y: 50, zone: "center" },
        { id: "seventeen", name: "17", x: 85, y: 50, zone: "center" },
    ],
    volleyball: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 16, y: 4, zone: "center" },
        { id: "three", name: "3", x: 30, y: 4, zone: "center" },
        { id: "four", name: "4", x: 44, y: 4, zone: "center" },
        { id: "five", name: "5", x: 50, y: 4, zone: "center" },
        { id: "six", name: "6", x: 56, y: 4, zone: "center" },
        { id: "seven", name: "7", x: 70, y: 4, zone: "center" },
        { id: "eight", name: "8", x: 84, y: 4, zone: "center" },
        { id: "nine", name: "9", x: 98, y: 4, zone: "center" },
        { id: "ten", name: "10", x: 98, y: 50, zone: "center" },
        { id: "eleven", name: "11", x: 98, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 84, y: 96, zone: "center" },
        { id: "thirteen", name: "13", x: 70, y: 96, zone: "center" },
        { id: "fourteen", name: "14", x: 56, y: 96, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 96, zone: "center" },
        { id: "sixteen", name: "16", x: 44, y: 96, zone: "center" },
        { id: "seventeen", name: "17", x: 30, y: 96, zone: "center" },
        { id: "eighteen", name: "18", x: 16, y: 96, zone: "center" },
        { id: "nineteen", name: "19", x: 2, y: 96, zone: "center" },
        { id: "twenty", name: "20", x: 2, y: 50, zone: "center" },
        { id: "twentyone", name: "21", x: 16, y: 50, zone: "center" },
        { id: "twentytwo", name: "22", x: 30, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 44, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 50, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 56, y: 50, zone: "center" },
        { id: "twentyfour", name: "24", x: 70, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 84, y: 50, zone: "center" },
    ],
    badminton: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 16, y: 4, zone: "center" },
        { id: "three", name: "3", x: 30, y: 4, zone: "center" },
        { id: "four", name: "4", x: 44, y: 4, zone: "center" },
        { id: "five", name: "5", x: 50, y: 4, zone: "center" },
        { id: "six", name: "6", x: 56, y: 4, zone: "center" },
        { id: "seven", name: "7", x: 70, y: 4, zone: "center" },
        { id: "eight", name: "8", x: 84, y: 4, zone: "center" },
        { id: "nine", name: "9", x: 98, y: 4, zone: "center" },
        { id: "ten", name: "10", x: 98, y: 50, zone: "center" },
        { id: "eleven", name: "11", x: 98, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 84, y: 96, zone: "center" },
        { id: "thirteen", name: "13", x: 70, y: 96, zone: "center" },
        { id: "fourteen", name: "14", x: 56, y: 96, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 96, zone: "center" },
        { id: "sixteen", name: "16", x: 44, y: 96, zone: "center" },
        { id: "seventeen", name: "17", x: 30, y: 96, zone: "center" },
        { id: "eighteen", name: "18", x: 16, y: 96, zone: "center" },
        { id: "nineteen", name: "19", x: 2, y: 96, zone: "center" },
        { id: "twenty", name: "20", x: 2, y: 50, zone: "center" },
        { id: "twentyone", name: "21", x: 16, y: 50, zone: "center" },
        { id: "twentytwo", name: "22", x: 30, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 44, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 50, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 56, y: 50, zone: "center" },
        { id: "twentyfour", name: "24", x: 70, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 84, y: 50, zone: "center" },
    ],
    pickleball: [
        // Góc sân
        { id: "corner-tl", name: "Góc trái trên", x: 8, y: 8, zone: "corner" },
        { id: "corner-tr", name: "Góc phải trên", x: 92, y: 8, zone: "corner" },
        { id: "corner-bl", name: "Góc trái dưới", x: 8, y: 92, zone: "corner" },
        {
            id: "corner-br",
            name: "Góc phải dưới",
            x: 92,
            y: 92,
            zone: "corner",
        },

        // Lưới
        {
            id: "net-center",
            name: "Trung tâm lưới",
            x: 50,
            y: 50,
            zone: "center",
        },
        { id: "net-left", name: "Lưới trái", x: 20, y: 50, zone: "center" },
        { id: "net-right", name: "Lưới phải", x: 80, y: 50, zone: "center" },

        // Vùng không volley (Kitchen)
        {
            id: "kitchen-tl",
            name: "Kitchen trái trên",
            x: 25,
            y: 35,
            zone: "penalty",
        },
        {
            id: "kitchen-tr",
            name: "Kitchen phải trên",
            x: 75,
            y: 35,
            zone: "penalty",
        },
        {
            id: "kitchen-bl",
            name: "Kitchen trái dưới",
            x: 25,
            y: 65,
            zone: "penalty",
        },
        {
            id: "kitchen-br",
            name: "Kitchen phải dưới",
            x: 75,
            y: 65,
            zone: "penalty",
        },

        // Baseline
        {
            id: "baseline-top",
            name: "Baseline trên",
            x: 50,
            y: 8,
            zone: "side",
        },
        {
            id: "baseline-bottom",
            name: "Baseline dưới",
            x: 50,
            y: 92,
            zone: "side",
        },

        // Khu vực thiết bị
        {
            id: "equipment-left",
            name: "Khu thiết bị trái",
            x: 5,
            y: 50,
            zone: "equipment",
        },
        {
            id: "equipment-right",
            name: "Khu thiết bị phải",
            x: 95,
            y: 50,
            zone: "equipment",
        },
    ],
};

const ZONE_COLORS = {
    corner: "bg-red-100 border-red-300 hover:bg-red-200",
    center: "bg-blue-100 border-blue-300 hover:bg-blue-200",
    goal: "bg-green-100 border-green-300 hover:bg-green-200",
    penalty: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
    side: "bg-purple-100 border-purple-300 hover:bg-purple-200",
    equipment: "bg-orange-100 border-orange-300 hover:bg-orange-200",
};

const ZONE_SELECTED_COLORS = {
    corner: "bg-red-500 border-red-600 text-white",
    center: "bg-blue-500 border-blue-600 text-white",
    goal: "bg-green-500 border-green-600 text-white",
    penalty: "bg-yellow-500 border-yellow-600 text-white",
    side: "bg-purple-500 border-purple-600 text-white",
    equipment: "bg-orange-500 border-orange-600 text-white",
};

export default function LocationPicker({
    selectedLocation,
    onLocationSelect,
    courtType = "general",
    className,
    locationNote,
    onLocationNoteChange,
    courtCode,
}: LocationPickerProps) {
    const locations = COURT_LOCATIONS[courtType] || COURT_LOCATIONS.general;

    // Xác định các ô được phép chọn theo courtCode
    let enabledLocationIds: string[] | undefined = undefined;
    if (courtCode === "BD5-01") {
        enabledLocationIds = [
            "one",
            "two",
            "three",
            "seventeen",
            "eighteen",
            "nineteen",
            "twenty",
            "twentyone",
            "twentytwo",
        ];
    } else if (courtCode === "BD5-02") {
        enabledLocationIds = [
            "four",
            "five",
            "six",
            "twentytwo",
            "twentythree",
            "twentyfour",
            "fourteen",
            "fifteen",
            "sixteen",
        ];
    } else if (courtCode === "BD5-03") {
        enabledLocationIds = [
            "seven",
            "eight",
            "nine",
            "ten",
            "eleven",
            "twelve",
            "thirteen",
            "twentyfour",
            "twentyfive",
        ];
    }

    const handleLocationClick = (location: LocationPoint) => {
        if (enabledLocationIds && !enabledLocationIds.includes(location.id))
            return;
        onLocationSelect(location.id, location.name);
    };

    return (
        <div className={cn("w-full", className)}>
            <div className="space-y-4">
                <div className="text-sm text-gray-600">
                    <p className="font-medium">
                        🎯 Chọn vị trí thiết bị trực quan
                    </p>
                </div>

                {/* Court visualization */}
                <div className="relative w-full max-h-[220px] h-full min-h-[220px] bg-green-50 border-2 border-green-200 rounded-lg overflow-hidden">
                    {/* Court markings */}
                    <div className="absolute inset-2 border-2 border-white rounded"></div>

                    {/* Court-specific markings */}
                    {courtType === "football" && (
                        <>
                            {/* Center line */}
                            <div className="absolute top-2 bottom-2 left-1/2 w-0.5 bg-white transform -translate-x-px"></div>
                            {/* Center circle */}
                            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                            {/* Goal areas */}
                            <div className="absolute top-2 left-1/2 w-12 h-8 border-2 border-white border-t-0 transform -translate-x-1/2"></div>
                            <div className="absolute bottom-2 left-1/2 w-12 h-8 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                        </>
                    )}

                    {courtType === "basketball" && (
                        <>
                            {/* Center line */}
                            <div className="absolute top-2 bottom-2 left-1/2 w-0.5 bg-white transform -translate-x-px"></div>
                            {/* Center circle */}
                            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                            {/* Free throw areas */}
                            <div className="absolute top-2 left-1/2 w-8 h-12 border-2 border-white border-t-0 transform -translate-x-1/2"></div>
                            <div className="absolute bottom-2 left-1/2 w-8 h-12 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                        </>
                    )}

                    {(courtType === "tennis" ||
                        courtType === "badminton" ||
                        courtType === "pickleball") && (
                        <>
                            {/* Net */}
                            <div className="absolute top-2 bottom-2 left-1/2 w-1 bg-gray-400 transform -translate-x-px"></div>
                            {/* Service lines for tennis/badminton */}
                            {courtType !== "pickleball" && (
                                <>
                                    <div className="absolute top-1/4 left-2 right-2 h-0.5 bg-white"></div>
                                    <div className="absolute bottom-1/4 left-2 right-2 h-0.5 bg-white"></div>
                                </>
                            )}
                            {/* Kitchen line for pickleball */}
                            {courtType === "pickleball" && (
                                <>
                                    <div className="absolute top-1/3 left-2 right-2 h-0.5 bg-white"></div>
                                    <div className="absolute bottom-1/3 left-2 right-2 h-0.5 bg-white"></div>
                                </>
                            )}
                        </>
                    )}

                    {courtType === "volleyball" && (
                        <>
                            {/* Net */}
                            <div className="absolute top-2 bottom-2 left-1/2 w-1 bg-gray-400 transform -translate-x-px"></div>
                            {/* Attack lines */}
                            <div className="absolute top-1/4 left-2 right-1/2 h-0.5 bg-white"></div>
                            <div className="absolute top-1/4 left-1/2 right-2 h-0.5 bg-white"></div>
                            <div className="absolute bottom-1/4 left-2 right-1/2 h-0.5 bg-white"></div>
                            <div className="absolute bottom-1/4 left-1/2 right-2 h-0.5 bg-white"></div>
                        </>
                    )}

                    {/* Location points */}
                    {locations.map((location) => {
                        const isSelected = selectedLocation === location.id;
                        const baseColors = isSelected
                            ? ZONE_SELECTED_COLORS[location.zone]
                            : ZONE_COLORS[location.zone];
                        const isDisabled =
                            enabledLocationIds &&
                            !enabledLocationIds.includes(location.id);

                        return (
                            <button
                                key={location.id}
                                type="button"
                                onClick={() => handleLocationClick(location)}
                                className={cn(
                                    "absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                                    baseColors,
                                    isSelected && "scale-125 shadow-lg",
                                    isDisabled &&
                                        "opacity-40 cursor-not-allowed hover:scale-100"
                                )}
                                style={{
                                    left: `${location.x}%`,
                                    top: `${location.y}%`,
                                }}
                                title={location.name}
                                disabled={isDisabled}
                            />
                        );
                    })}
                </div>

                {/* Selected location display */}
                {selectedLocation && (
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-blue-900 flex items-center gap-2 w-full">
                                📍 Vị trí đã chọn:{" "}
                                <span className="font-semibold">
                                    {
                                        locations.find(
                                            (l) => l.id === selectedLocation
                                        )?.name
                                    }
                                </span>
                                {/* Ghi chú thêm về vị trí */}
                                <textarea
                                    placeholder="Ghi chú thêm..."
                                    className="bg-white ml-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1 resize-none min-h-[32px] max-h-[128px] overflow-y-auto"
                                    value={
                                        typeof locationNote === "string"
                                            ? locationNote
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const ta = e.target;
                                        ta.style.height = "auto";
                                        // Tính chiều cao tối đa cho 4 hàng
                                        const lineHeight = 20; // px, tuỳ theo px của text-sm và padding
                                        const maxRows = 4;
                                        const maxHeight =
                                            lineHeight * maxRows + 8; // 8px padding
                                        ta.style.height =
                                            Math.min(
                                                ta.scrollHeight,
                                                maxHeight
                                            ) + "px";
                                        if (onLocationNoteChange)
                                            onLocationNoteChange(
                                                e.target.value
                                            );
                                    }}
                                    rows={1}
                                    style={{
                                        height: "auto",
                                        minHeight: 32,
                                        maxHeight: 128,
                                        overflowY: "auto",
                                    }}
                                />
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
