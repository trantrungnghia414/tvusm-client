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
        // Sân 1 (trái) - Hướng đứng
        {
            id: "field1-goal-top",
            name: "Sân 1 - Khung thành trên",
            x: 17,
            y: 5,
            zone: "goal",
        },
        {
            id: "field1-goal-bottom",
            name: "Sân 1 - Khung thành dưới",
            x: 17,
            y: 95,
            zone: "goal",
        },
        {
            id: "field1-corner-tl",
            name: "Sân 1 - Góc trái trên",
            x: 8,
            y: 10,
            zone: "corner",
        },
        {
            id: "field1-corner-tr",
            name: "Sân 1 - Góc phải trên",
            x: 26,
            y: 10,
            zone: "corner",
        },
        {
            id: "field1-corner-bl",
            name: "Sân 1 - Góc trái dưới",
            x: 8,
            y: 90,
            zone: "corner",
        },
        {
            id: "field1-corner-br",
            name: "Sân 1 - Góc phải dưới",
            x: 26,
            y: 90,
            zone: "corner",
        },
        {
            id: "field1-center",
            name: "Sân 1 - Trung tâm",
            x: 17,
            y: 50,
            zone: "center",
        },
        {
            id: "field1-penalty-top",
            name: "Sân 1 - Vùng cấm trên",
            x: 17,
            y: 25,
            zone: "penalty",
        },
        {
            id: "field1-penalty-bottom",
            name: "Sân 1 - Vùng cấm dưới",
            x: 17,
            y: 75,
            zone: "penalty",
        },
        {
            id: "field1-side-left",
            name: "Sân 1 - Biên trái",
            x: 8,
            y: 50,
            zone: "side",
        },
        {
            id: "field1-side-right",
            name: "Sân 1 - Biên phải",
            x: 26,
            y: 50,
            zone: "side",
        },

        // Sân 2 (giữa) - Hướng đứng
        {
            id: "field2-goal-top",
            name: "Sân 2 - Khung thành trên",
            x: 50,
            y: 5,
            zone: "goal",
        },
        {
            id: "field2-goal-bottom",
            name: "Sân 2 - Khung thành dưới",
            x: 50,
            y: 95,
            zone: "goal",
        },
        {
            id: "field2-corner-tl",
            name: "Sân 2 - Góc trái trên",
            x: 41,
            y: 10,
            zone: "corner",
        },
        {
            id: "field2-corner-tr",
            name: "Sân 2 - Góc phải trên",
            x: 59,
            y: 10,
            zone: "corner",
        },
        {
            id: "field2-corner-bl",
            name: "Sân 2 - Góc trái dưới",
            x: 41,
            y: 90,
            zone: "corner",
        },
        {
            id: "field2-corner-br",
            name: "Sân 2 - Góc phải dưới",
            x: 59,
            y: 90,
            zone: "corner",
        },
        {
            id: "field2-center",
            name: "Sân 2 - Trung tâm",
            x: 50,
            y: 50,
            zone: "center",
        },
        {
            id: "field2-penalty-top",
            name: "Sân 2 - Vùng cấm trên",
            x: 50,
            y: 25,
            zone: "penalty",
        },
        {
            id: "field2-penalty-bottom",
            name: "Sân 2 - Vùng cấm dưới",
            x: 50,
            y: 75,
            zone: "penalty",
        },
        {
            id: "field2-side-left",
            name: "Sân 2 - Biên trái",
            x: 41,
            y: 50,
            zone: "side",
        },
        {
            id: "field2-side-right",
            name: "Sân 2 - Biên phải",
            x: 59,
            y: 50,
            zone: "side",
        },

        // Sân 3 (phải) - Hướng đứng
        {
            id: "field3-goal-top",
            name: "Sân 3 - Khung thành trên",
            x: 83,
            y: 5,
            zone: "goal",
        },
        {
            id: "field3-goal-bottom",
            name: "Sân 3 - Khung thành dưới",
            x: 83,
            y: 95,
            zone: "goal",
        },
        {
            id: "field3-corner-tl",
            name: "Sân 3 - Góc trái trên",
            x: 74,
            y: 10,
            zone: "corner",
        },
        {
            id: "field3-corner-tr",
            name: "Sân 3 - Góc phải trên",
            x: 92,
            y: 10,
            zone: "corner",
        },
        {
            id: "field3-corner-bl",
            name: "Sân 3 - Góc trái dưới",
            x: 74,
            y: 90,
            zone: "corner",
        },
        {
            id: "field3-corner-br",
            name: "Sân 3 - Góc phải dưới",
            x: 92,
            y: 90,
            zone: "corner",
        },
        {
            id: "field3-center",
            name: "Sân 3 - Trung tâm",
            x: 83,
            y: 50,
            zone: "center",
        },
        {
            id: "field3-penalty-top",
            name: "Sân 3 - Vùng cấm trên",
            x: 83,
            y: 25,
            zone: "penalty",
        },
        {
            id: "field3-penalty-bottom",
            name: "Sân 3 - Vùng cấm dưới",
            x: 83,
            y: 75,
            zone: "penalty",
        },
        {
            id: "field3-side-left",
            name: "Sân 3 - Biên trái",
            x: 74,
            y: 50,
            zone: "side",
        },
        {
            id: "field3-side-right",
            name: "Sân 3 - Biên phải",
            x: 92,
            y: 50,
            zone: "side",
        },

        // Vùng chung và khu thiết bị
        {
            id: "center-line",
            name: "Đường giữa sân lớn",
            x: 50,
            y: 50,
            zone: "center",
        },
        {
            id: "equipment-left",
            name: "Khu thiết bị trái",
            x: 2,
            y: 50,
            zone: "equipment",
        },
        {
            id: "equipment-right",
            name: "Khu thiết bị phải",
            x: 98,
            y: 50,
            zone: "equipment",
        },
        {
            id: "equipment-top",
            name: "Khu thiết bị trên",
            x: 50,
            y: 2,
            zone: "equipment",
        },
        {
            id: "equipment-bottom",
            name: "Khu thiết bị dưới",
            x: 50,
            y: 98,
            zone: "equipment",
        },
        {
            id: "bench-left",
            name: "Ghế dự bị trái",
            x: 2,
            y: 25,
            zone: "equipment",
        },
        {
            id: "bench-right",
            name: "Ghế dự bị phải",
            x: 98,
            y: 75,
            zone: "equipment",
        },
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
                    <p className="text-xs mt-1">
                        Click vào các điểm màu để chọn vị trí cụ thể trên{" "}
                        {courtType === "football"
                            ? "3 sân bóng đá 5 người (hướng đứng) ghép thành sân 7 người"
                            : `sân ${
                                  courtType === "general"
                                      ? "thể thao"
                                      : courtType
                              }`}
                    </p>
                </div>

                {/* Court visualization */}
                <div className="relative w-full h-80 bg-green-50 border-2 border-green-200 rounded-lg overflow-hidden">
                    {/* Court markings */}
                    <div className="absolute inset-2 border-2 border-white rounded"></div>

                    {/* Court-specific markings */}
                    {courtType === "football" && (
                        <>
                            {/* Sân 1 (trái) - Hướng đứng */}
                            <div
                                className="absolute border-2 border-white rounded"
                                style={{
                                    left: "6%",
                                    top: "8%",
                                    width: "22%",
                                    height: "84%",
                                }}
                            ></div>
                            {/* Đường giữa sân 1 */}
                            <div
                                className="absolute w-0.5 bg-white"
                                style={{
                                    left: "17%",
                                    top: "8%",
                                    height: "84%",
                                }}
                            ></div>
                            {/* Vòng tròn giữa sân 1 */}
                            <div
                                className="absolute w-6 h-6 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: "17%", top: "50%" }}
                            ></div>
                            {/* Khung thành sân 1 */}
                            <div
                                className="absolute h-3 border-2 border-white border-t-0"
                                style={{ left: "12%", top: "8%", width: "10%" }}
                            ></div>
                            <div
                                className="absolute h-3 border-2 border-white border-b-0"
                                style={{
                                    left: "12%",
                                    bottom: "8%",
                                    width: "10%",
                                }}
                            ></div>
                            {/* Vùng cấm sân 1 */}
                            <div
                                className="absolute border-2 border-white border-t-0"
                                style={{
                                    left: "10%",
                                    top: "8%",
                                    width: "14%",
                                    height: "20%",
                                }}
                            ></div>
                            <div
                                className="absolute border-2 border-white border-b-0"
                                style={{
                                    left: "10%",
                                    bottom: "8%",
                                    width: "14%",
                                    height: "20%",
                                }}
                            ></div>

                            {/* Sân 2 (giữa) - Hướng đứng */}
                            <div
                                className="absolute border-2 border-white rounded"
                                style={{
                                    left: "39%",
                                    top: "8%",
                                    width: "22%",
                                    height: "84%",
                                }}
                            ></div>
                            {/* Đường giữa sân 2 */}
                            <div
                                className="absolute w-0.5 bg-white"
                                style={{
                                    left: "50%",
                                    top: "8%",
                                    height: "84%",
                                }}
                            ></div>
                            {/* Vòng tròn giữa sân 2 */}
                            <div
                                className="absolute w-6 h-6 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: "50%", top: "50%" }}
                            ></div>
                            {/* Khung thành sân 2 */}
                            <div
                                className="absolute h-3 border-2 border-white border-t-0"
                                style={{ left: "45%", top: "8%", width: "10%" }}
                            ></div>
                            <div
                                className="absolute h-3 border-2 border-white border-b-0"
                                style={{
                                    left: "45%",
                                    bottom: "8%",
                                    width: "10%",
                                }}
                            ></div>
                            {/* Vùng cấm sân 2 */}
                            <div
                                className="absolute border-2 border-white border-t-0"
                                style={{
                                    left: "43%",
                                    top: "8%",
                                    width: "14%",
                                    height: "20%",
                                }}
                            ></div>
                            <div
                                className="absolute border-2 border-white border-b-0"
                                style={{
                                    left: "43%",
                                    bottom: "8%",
                                    width: "14%",
                                    height: "20%",
                                }}
                            ></div>

                            {/* Sân 3 (phải) - Hướng đứng */}
                            <div
                                className="absolute border-2 border-white rounded"
                                style={{
                                    left: "72%",
                                    top: "8%",
                                    width: "22%",
                                    height: "84%",
                                }}
                            ></div>
                            {/* Đường giữa sân 3 */}
                            <div
                                className="absolute w-0.5 bg-white"
                                style={{
                                    left: "83%",
                                    top: "8%",
                                    height: "84%",
                                }}
                            ></div>
                            {/* Vòng tròn giữa sân 3 */}
                            <div
                                className="absolute w-6 h-6 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: "83%", top: "50%" }}
                            ></div>
                            {/* Khung thành sân 3 */}
                            <div
                                className="absolute h-3 border-2 border-white border-t-0"
                                style={{ left: "78%", top: "8%", width: "10%" }}
                            ></div>
                            <div
                                className="absolute h-3 border-2 border-white border-b-0"
                                style={{
                                    left: "78%",
                                    bottom: "8%",
                                    width: "10%",
                                }}
                            ></div>
                            {/* Vùng cấm sân 3 */}
                            <div
                                className="absolute border-2 border-white border-t-0"
                                style={{
                                    left: "76%",
                                    top: "8%",
                                    width: "14%",
                                    height: "20%",
                                }}
                            ></div>
                            <div
                                className="absolute border-2 border-white border-b-0"
                                style={{
                                    left: "76%",
                                    bottom: "8%",
                                    width: "14%",
                                    height: "20%",
                                }}
                            ></div>

                            {/* Đường phân chia giữa các sân */}
                            <div
                                className="absolute w-0.5 bg-gray-300"
                                style={{
                                    left: "28%",
                                    top: "8%",
                                    height: "84%",
                                }}
                            ></div>
                            <div
                                className="absolute w-0.5 bg-gray-300"
                                style={{
                                    left: "61%",
                                    top: "8%",
                                    height: "84%",
                                }}
                            ></div>
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

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
                        <span>Góc sân</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div>
                        <span>Trung tâm</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
                        <span>Khung thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div>
                        <span>Vùng đặc biệt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300"></div>
                        <span>Biên sân</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-300"></div>
                        <span>Khu thiết bị</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
