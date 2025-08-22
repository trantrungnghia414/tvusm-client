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
}

// Định nghĩa các vị trí cho từng loại sân
const COURT_LOCATIONS: Record<string, LocationPoint[]> = {
    football: [
        // Hàng trên - từ trái sang phải
        { id: "one", name: "1", x: 2, y: 4, zone: "center" },
        { id: "two", name: "2", x: 15, y: 3, zone: "center" },
        { id: "three", name: "3", x: 32, y: 2, zone: "center" },
        { id: "four", name: "4", x: 34, y: 2, zone: "center" },
        { id: "five", name: "5", x: 50, y: 3, zone: "center" },
        { id: "six", name: "6", x: 65, y: 2, zone: "center" },
        { id: "seven", name: "7", x: 67, y: 2, zone: "center" },
        { id: "eight", name: "8", x: 85, y: 3, zone: "center" },
        { id: "nine", name: "9", x: 98, y: 4, zone: "center" },

        // Bên phải - từ trên xuống dưới
        { id: "ten", name: "10", x: 98, y: 50, zone: "center" },

        // Hàng dưới - từ phải sang trái
        { id: "eleven", name: "11", x: 98, y: 96, zone: "center" },
        { id: "twelve", name: "12", x: 85, y: 97, zone: "center" },
        { id: "thirteen", name: "13", x: 67, y: 98, zone: "center" },
        { id: "fourteen", name: "14", x: 65, y: 98, zone: "center" },
        { id: "fifteen", name: "15", x: 50, y: 97, zone: "center" },
        { id: "sixteen", name: "16", x: 34, y: 98, zone: "center" },
        { id: "seventeen", name: "17", x: 32, y: 98, zone: "center" },
        { id: "eighteen", name: "18", x: 15, y: 97, zone: "center" },
        { id: "nineteen", name: "19", x: 2, y: 96, zone: "center" },

        // Bên trái - từ dưới lên trên
        { id: "twenty", name: "20", x: 2, y: 50, zone: "center" },

        // Trung tâm - từ trái sang phải
        { id: "twentyone", name: "21", x: 15, y: 50, zone: "center" },
        { id: "twentytwo", name: "22", x: 33, y: 50, zone: "center" },
        { id: "twentythree", name: "23", x: 50, y: 50, zone: "center" },
        { id: "twentyfour", name: "24", x: 65, y: 50, zone: "center" },
        { id: "twentyfive", name: "25", x: 85, y: 50, zone: "center" },
    ],
    basketball: [
        // Góc sân
        { id: "corner-tl", name: "Góc trái trên", x: 5, y: 5, zone: "corner" },
        { id: "corner-tr", name: "Góc phải trên", x: 95, y: 5, zone: "corner" },
        { id: "corner-bl", name: "Góc trái dưới", x: 5, y: 95, zone: "corner" },
        {
            id: "corner-br",
            name: "Góc phải dưới",
            x: 95,
            y: 95,
            zone: "corner",
        },

        // Trung tâm
        { id: "center", name: "Trung tâm sân", x: 50, y: 50, zone: "center" },

        // Rổ bóng
        { id: "basket-top", name: "Rổ trên", x: 50, y: 8, zone: "goal" },
        { id: "basket-bottom", name: "Rổ dưới", x: 50, y: 92, zone: "goal" },

        // Vòng tròn ném phạt
        {
            id: "freethrow-top",
            name: "Vòng phạt trên",
            x: 50,
            y: 25,
            zone: "penalty",
        },
        {
            id: "freethrow-bottom",
            name: "Vòng phạt dưới",
            x: 50,
            y: 75,
            zone: "penalty",
        },

        // Biên sân
        { id: "side-left", name: "Biên trái", x: 2, y: 50, zone: "side" },
        { id: "side-right", name: "Biên phải", x: 98, y: 50, zone: "side" },

        // Khu vực thiết bị
        {
            id: "equipment-left",
            name: "Khu thiết bị trái",
            x: 15,
            y: 50,
            zone: "equipment",
        },
        {
            id: "equipment-right",
            name: "Khu thiết bị phải",
            x: 85,
            y: 50,
            zone: "equipment",
        },
    ],
    tennis: [
        // Góc sân
        { id: "corner-tl", name: "Góc trái trên", x: 5, y: 5, zone: "corner" },
        { id: "corner-tr", name: "Góc phải trên", x: 95, y: 5, zone: "corner" },
        { id: "corner-bl", name: "Góc trái dưới", x: 5, y: 95, zone: "corner" },
        {
            id: "corner-br",
            name: "Góc phải dưới",
            x: 95,
            y: 95,
            zone: "corner",
        },

        // Trung tâm
        { id: "center", name: "Trung tâm sân", x: 50, y: 50, zone: "center" },

        // Lưới
        { id: "net-left", name: "Lưới trái", x: 20, y: 50, zone: "center" },
        {
            id: "net-center",
            name: "Trung tâm lưới",
            x: 50,
            y: 50,
            zone: "center",
        },
        { id: "net-right", name: "Lưới phải", x: 80, y: 50, zone: "center" },

        // Vùng phục vụ
        {
            id: "service-tl",
            name: "Ô phục vụ trái trên",
            x: 25,
            y: 25,
            zone: "penalty",
        },
        {
            id: "service-tr",
            name: "Ô phục vụ phải trên",
            x: 75,
            y: 25,
            zone: "penalty",
        },
        {
            id: "service-bl",
            name: "Ô phục vụ trái dưới",
            x: 25,
            y: 75,
            zone: "penalty",
        },
        {
            id: "service-br",
            name: "Ô phục vụ phải dưới",
            x: 75,
            y: 75,
            zone: "penalty",
        },

        // Khu vực thiết bị
        {
            id: "equipment-left",
            name: "Khu thiết bị trái",
            x: 10,
            y: 50,
            zone: "equipment",
        },
        {
            id: "equipment-right",
            name: "Khu thiết bị phải",
            x: 90,
            y: 50,
            zone: "equipment",
        },
    ],
    volleyball: [
        // Góc sân
        { id: "corner-tl", name: "Góc trái trên", x: 5, y: 5, zone: "corner" },
        { id: "corner-tr", name: "Góc phải trên", x: 95, y: 5, zone: "corner" },
        { id: "corner-bl", name: "Góc trái dưới", x: 5, y: 95, zone: "corner" },
        {
            id: "corner-br",
            name: "Góc phải dưới",
            x: 95,
            y: 95,
            zone: "corner",
        },

        // Trung tâm và lưới
        {
            id: "net-center",
            name: "Trung tâm lưới",
            x: 50,
            y: 50,
            zone: "center",
        },
        { id: "net-left", name: "Lưới trái", x: 10, y: 50, zone: "center" },
        { id: "net-right", name: "Lưới phải", x: 90, y: 50, zone: "center" },

        // Vùng tấn công
        {
            id: "attack-top",
            name: "Vùng tấn công trên",
            x: 50,
            y: 25,
            zone: "penalty",
        },
        {
            id: "attack-bottom",
            name: "Vùng tấn công dưới",
            x: 50,
            y: 75,
            zone: "penalty",
        },

        // Khu vực thiết bị
        {
            id: "equipment-tl",
            name: "Khu thiết bị trái trên",
            x: 15,
            y: 15,
            zone: "equipment",
        },
        {
            id: "equipment-tr",
            name: "Khu thiết bị phải trên",
            x: 85,
            y: 15,
            zone: "equipment",
        },
        {
            id: "equipment-bl",
            name: "Khu thiết bị trái dưới",
            x: 15,
            y: 85,
            zone: "equipment",
        },
        {
            id: "equipment-br",
            name: "Khu thiết bị phải dưới",
            x: 85,
            y: 85,
            zone: "equipment",
        },
    ],
    badminton: [
        // Góc sân
        { id: "corner-tl", name: "Góc trái trên", x: 5, y: 5, zone: "corner" },
        { id: "corner-tr", name: "Góc phải trên", x: 95, y: 5, zone: "corner" },
        { id: "corner-bl", name: "Góc trái dưới", x: 5, y: 95, zone: "corner" },
        {
            id: "corner-br",
            name: "Góc phải dưới",
            x: 95,
            y: 95,
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
        { id: "net-left", name: "Lưới trái", x: 15, y: 50, zone: "center" },
        { id: "net-right", name: "Lưới phải", x: 85, y: 50, zone: "center" },

        // Vùng phục vụ
        {
            id: "service-tl",
            name: "Ô phục vụ trái trên",
            x: 25,
            y: 25,
            zone: "penalty",
        },
        {
            id: "service-tr",
            name: "Ô phục vụ phải trên",
            x: 75,
            y: 25,
            zone: "penalty",
        },
        {
            id: "service-bl",
            name: "Ô phục vụ trái dưới",
            x: 25,
            y: 75,
            zone: "penalty",
        },
        {
            id: "service-br",
            name: "Ô phục vụ phải dưới",
            x: 75,
            y: 75,
            zone: "penalty",
        },

        // Biên sân
        { id: "side-left", name: "Biên trái", x: 2, y: 50, zone: "side" },
        { id: "side-right", name: "Biên phải", x: 98, y: 50, zone: "side" },

        // Khu vực thiết bị
        {
            id: "equipment-left",
            name: "Khu thiết bị trái",
            x: 10,
            y: 30,
            zone: "equipment",
        },
        {
            id: "equipment-right",
            name: "Khu thiết bị phải",
            x: 90,
            y: 30,
            zone: "equipment",
        },
        {
            id: "equipment-bl",
            name: "Khu thiết bị trái dưới",
            x: 10,
            y: 70,
            zone: "equipment",
        },
        {
            id: "equipment-br",
            name: "Khu thiết bị phải dưới",
            x: 90,
            y: 70,
            zone: "equipment",
        },
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
    general: [
        // Góc
        {
            id: "corner-tl",
            name: "Góc trái trên",
            x: 10,
            y: 10,
            zone: "corner",
        },
        {
            id: "corner-tr",
            name: "Góc phải trên",
            x: 90,
            y: 10,
            zone: "corner",
        },
        {
            id: "corner-bl",
            name: "Góc trái dưới",
            x: 10,
            y: 90,
            zone: "corner",
        },
        {
            id: "corner-br",
            name: "Góc phải dưới",
            x: 90,
            y: 90,
            zone: "corner",
        },

        // Trung tâm
        { id: "center", name: "Trung tâm", x: 50, y: 50, zone: "center" },
        {
            id: "center-left",
            name: "Trung tâm trái",
            x: 25,
            y: 50,
            zone: "center",
        },
        {
            id: "center-right",
            name: "Trung tâm phải",
            x: 75,
            y: 50,
            zone: "center",
        },
        {
            id: "center-top",
            name: "Trung tâm trên",
            x: 50,
            y: 25,
            zone: "center",
        },
        {
            id: "center-bottom",
            name: "Trung tâm dưới",
            x: 50,
            y: 75,
            zone: "center",
        },

        // Biên
        { id: "side-left", name: "Biên trái", x: 5, y: 50, zone: "side" },
        { id: "side-right", name: "Biên phải", x: 95, y: 50, zone: "side" },
        { id: "side-top", name: "Biên trên", x: 50, y: 5, zone: "side" },
        { id: "side-bottom", name: "Biên dưới", x: 50, y: 95, zone: "side" },

        // Khu vực thiết bị
        {
            id: "equipment-center",
            name: "Khu thiết bị trung tâm",
            x: 50,
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
}: LocationPickerProps) {
    const locations = COURT_LOCATIONS[courtType] || COURT_LOCATIONS.general;

    const handleLocationClick = (location: LocationPoint) => {
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
                <div className="relative w-full h-60 bg-green-50 border-2 border-green-200 rounded-lg overflow-hidden">
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

                        return (
                            <button
                                key={location.id}
                                type="button"
                                onClick={() => handleLocationClick(location)}
                                className={cn(
                                    "absolute w-4 h-4 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                                    baseColors,
                                    isSelected && "scale-125 shadow-lg"
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

                {/* Selected location display */}
                {selectedLocation && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <p className="text-sm font-medium text-blue-900">
                                📍 Vị trí đã chọn:{" "}
                                <span className="font-semibold">
                                    {
                                        locations.find(
                                            (l) => l.id === selectedLocation
                                        )?.name
                                    }
                                </span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
