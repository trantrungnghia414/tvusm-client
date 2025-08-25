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
        { id: "twentyfour", name: "24", x: 50, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 56, y: 50, zone: "center" },
        { id: "twentysix", name: "26", x: 70, y: 50, zone: "center" },
        { id: "twentyseven", name: "27", x: 84, y: 50, zone: "center" },
    ],
    badminton: [
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 24, y: 4, zone: "center" },
        { id: "three", name: "3", x: 26, y: 4, zone: "center" },
        { id: "four", name: "4", x: 49, y: 4, zone: "center" },
        { id: "five", name: "5", x: 51, y: 4, zone: "center" },
        { id: "six", name: "6", x: 74, y: 4, zone: "center" },
        { id: "seven", name: "7", x: 76, y: 4, zone: "center" },
        { id: "eight", name: "8", x: 98, y: 4, zone: "center" },
        { id: "nine", name: "9", x: 98, y: 50, zone: "center" },
        { id: "ten", name: "10", x: 98, y: 96, zone: "center" },
        { id: "eleven", name: "11", x: 76, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 74, y: 96, zone: "center" },
        { id: "thirteen", name: "13", x: 51, y: 96, zone: "center" },
        { id: "fourteen", name: "14", x: 49, y: 96, zone: "center" },
        { id: "fifteen", name: "15", x: 26, y: 96, zone: "center" },
        { id: "sixteen", name: "16", x: 24, y: 96, zone: "center" },
        { id: "seventeen", name: "17", x: 2, y: 96, zone: "center" },
        { id: "eighteen", name: "18", x: 2, y: 50, zone: "center" },
        { id: "nineteen", name: "19", x: 13, y: 50, zone: "center" },
        { id: "twenty", name: "20", x: 24, y: 50, zone: "center" },
        { id: "twentyone", name: "21", x: 26, y: 50, zone: "center" },
        { id: "twentytwo", name: "22", x: 38, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 49, y: 50, zone: "center" },
        { id: "twentyfour", name: "24", x: 51, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 62, y: 50, zone: "center" },
        { id: "twentysix", name: "26", x: 74, y: 50, zone: "center" },
        { id: "twentyseven", name: "27", x: 76, y: 50, zone: "center" },
        { id: "twentyeight", name: "28", x: 87, y: 50, zone: "center" },
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

                    {/* {courtType === "football" && (
                        <>
                            <div className="absolute top-2 bottom-2 left-1/2 w-0.5 bg-white transform -translate-x-px"></div>
                            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-2 left-1/2 w-12 h-8 border-2 border-white border-t-0 transform -translate-x-1/2"></div>
                            <div className="absolute bottom-2 left-1/2 w-12 h-8 border-2 border-white border-b-0 transform -translate-x-1/2"></div>
                        </>
                    )} */}
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

                    {(courtType === "tennis" || courtType === "pickleball") && (
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

                    {/* Badminton: Net lines cho từng sân */}
                    {courtType === "badminton" && (
                        <>
                            {/* Net CL-01: nối 18 và 20 */}
                            <div
                                className="absolute h-0.5 bg-gray-400"
                                style={{
                                    left: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "eighteen"
                                        )?.x
                                    }%`,
                                    top: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "eighteen"
                                        )?.y
                                    }%`,
                                    width: `${Math.abs(
                                        (COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twenty"
                                        )?.x ?? 0) -
                                            (COURT_LOCATIONS.badminton.find(
                                                (l) => l.id === "eighteen"
                                            )?.x ?? 0)
                                    )}%`,
                                }}
                            ></div>
                            {/* Net CL-02: nối 21 và 23 */}
                            <div
                                className="absolute h-0.5 bg-gray-400"
                                style={{
                                    left: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentyone"
                                        )?.x
                                    }%`,
                                    top: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentyone"
                                        )?.y
                                    }%`,
                                    width: `${Math.abs(
                                        (COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentythree"
                                        )?.x ?? 0) -
                                            (COURT_LOCATIONS.badminton.find(
                                                (l) => l.id === "twentyone"
                                            )?.x ?? 0)
                                    )}%`,
                                }}
                            ></div>
                            {/* Net CL-03: nối 24 và 26 */}
                            <div
                                className="absolute h-0.5 bg-gray-400"
                                style={{
                                    left: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentyfour"
                                        )?.x
                                    }%`,
                                    top: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentyfour"
                                        )?.y
                                    }%`,
                                    width: `${Math.abs(
                                        (COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentysix"
                                        )?.x ?? 0) -
                                            (COURT_LOCATIONS.badminton.find(
                                                (l) => l.id === "twentyfour"
                                            )?.x ?? 0)
                                    )}%`,
                                }}
                            ></div>
                            {/* Net CL-04: nối 27 và 9 */}
                            <div
                                className="absolute h-0.5 bg-gray-400"
                                style={{
                                    left: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentyseven"
                                        )?.x
                                    }%`,
                                    top: `${
                                        COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "twentyseven"
                                        )?.y
                                    }%`,
                                    width: `${Math.abs(
                                        (COURT_LOCATIONS.badminton.find(
                                            (l) => l.id === "nine"
                                        )?.x ?? 0) -
                                            (COURT_LOCATIONS.badminton.find(
                                                (l) => l.id === "twentyseven"
                                            )?.x ?? 0)
                                    )}%`,
                                }}
                            ></div>
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
