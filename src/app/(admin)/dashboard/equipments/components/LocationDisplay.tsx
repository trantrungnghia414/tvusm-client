"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LocationPoint {
    id: string;
    name: string;
    x: number;
    y: number;
    zone: "goal" | "penalty" | "center" | "corner" | "side" | "equipment";
}

interface LocationDisplayProps {
    selectedLocation?: string;
    courtType?:
        | "football"
        | "basketball"
        | "tennis"
        | "volleyball"
        | "badminton"
        | "pickleball"
        | "general";
    className?: string;
}

// Copy từ LocationPicker
const COURT_LOCATIONS: Record<string, LocationPoint[]> = {
    football: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 15, y: 3, zone: "center" },
        { id: "three", name: "3", x: 32, y: 2, zone: "center" },
        { id: "four", name: "4", x: 34, y: 2, zone: "center" },
        { id: "five", name: "5", x: 50, y: 3, zone: "center" },
        { id: "six", name: "6", x: 65, y: 2, zone: "center" },
        { id: "seven", name: "7", x: 67, y: 2, zone: "center" },
        { id: "eight", name: "8", x: 85, y: 3, zone: "center" },
        { id: "nine", name: "9", x: 98, y: 4, zone: "center" },
        { id: "ten", name: "10", x: 98, y: 50, zone: "center" },
        { id: "eleven", name: "11", x: 98, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 85, y: 97, zone: "center" },
        { id: "thirteen", name: "13", x: 67, y: 98, zone: "center" },
        { id: "fourteen", name: "14", x: 65, y: 98, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 97, zone: "center" },
        { id: "sixteen", name: "16", x: 34, y: 98, zone: "center" },
        { id: "seventeen", name: "17", x: 32, y: 98, zone: "center" },
        { id: "eighteen", name: "18", x: 15, y: 97, zone: "center" },
        { id: "nineteen", name: "19", x: 2, y: 96, zone: "center" },
        { id: "twenty", name: "20", x: 2, y: 50, zone: "center" },
        { id: "twentyone", name: "21", x: 15, y: 50, zone: "center" },
        { id: "twentytwo", name: "22", x: 33, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 50, y: 50, zone: "center" },
        { id: "twentyfour", name: "24", x: 65, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 85, y: 50, zone: "center" },
    ],
    general: [
        { id: "center", name: "Trung tâm", x: 50, y: 50, zone: "center" },
    ],
};

export default function LocationDisplay({
    selectedLocation,
    courtType = "general",
    className,
}: LocationDisplayProps) {
    const locations = COURT_LOCATIONS[courtType] || COURT_LOCATIONS.general;

    // Component này CHỈ HIỂN THỊ vị trí, KHÔNG có tương tác
    return (
        <div className={cn("w-full", className)}>
            <div className="space-y-4">
                <div className="text-sm text-gray-600">
                    <p className="font-medium">🎯 Vị trí thiết bị trên sân</p>
                    {selectedLocation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md">
                            <p className="text-blue-800 font-medium">
                                📍 {selectedLocation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Court visualization - CHỈ HIỂN THỊ, KHÔNG TƯƠNG TÁC */}
                <div className="relative w-full h-80 bg-green-50 border-2 border-green-200 rounded-lg overflow-hidden pointer-events-none">
                    <div className="absolute inset-2 border-2 border-white rounded"></div>

                    {courtType === "football" && (
                        <>
                            <div className="absolute top-2 bottom-2 left-1/2 w-0.5 bg-white transform -translate-x-px"></div>
                            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-2 left-1/2 w-12 h-8 border-2 border-white border-t-0 transform -translate-x-1/2"></div>
                            <div className="absolute bottom-2 left-1/2 w-12 h-8 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                        </>
                    )}

                    {/* Location points - chỉ hiển thị, không tương tác */}
                    {locations.map((location) => {
                        // Parse location from equipment location_detail
                        let isSelected = false;

                        if (selectedLocation) {
                            // Check if location matches with notes format
                            const noteIndex =
                                selectedLocation.indexOf(" - Ghi chú: ");
                            const baseLocation =
                                noteIndex !== -1
                                    ? selectedLocation.substring(0, noteIndex)
                                    : selectedLocation;

                            // Remove "Ghi chú: " prefix if it exists
                            const cleanLocation = baseLocation.startsWith(
                                "Ghi chú: "
                            )
                                ? baseLocation.substring("Ghi chú: ".length)
                                : baseLocation;

                            // Match with location id, name, or clean location
                            isSelected =
                                cleanLocation === location.id ||
                                cleanLocation === location.name ||
                                selectedLocation === location.id ||
                                selectedLocation === location.name;
                        }

                        return (
                            <div
                                key={location.id}
                                className={cn(
                                    "absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none",
                                    isSelected
                                        ? "bg-blue-500 border-blue-600 text-white scale-125 shadow-lg"
                                        : "bg-blue-100 border-blue-300"
                                )}
                                style={{
                                    left: `${location.x}%`,
                                    top: `${location.y}%`,
                                }}
                                title={location.name}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
