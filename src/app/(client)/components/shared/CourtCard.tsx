import React from "react";
import Link from "next/link";
import { CalendarDays, Info, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourtCardProps {
    id: number;
    name: string;
    code: string;
    type: string;
    hourlyRate: number;
    status: "available" | "booked" | "maintenance";
    image: string;
    venueId: number;
    venueName: string;
    isIndoor: boolean;
}

export default function CourtCard({
    id,
    name,
    code,
    type,
    hourlyRate,
    status,
    image,
    venueId,
    venueName,
    isIndoor,
}: CourtCardProps) {
    const statusColors = {
        available: "bg-green-100 text-green-800 border-green-200",
        booked: "bg-blue-100 text-blue-800 border-blue-200",
        maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    const statusLabels = {
        available: "Sẵn sàng",
        booked: "Đã đặt",
        maintenance: "Đang bảo trì",
    };

    // Định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={
                        image.startsWith("/")
                            ? `http://localhost:3000${image}`
                            : image
                    }
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                    <Badge
                        variant="outline"
                        className="bg-white/90 text-gray-800 backdrop-blur-sm"
                    >
                        {type}
                    </Badge>
                </div>
                <Badge
                    className={`absolute top-3 right-3 ${statusColors[status]}`}
                >
                    {statusLabels[status]}
                </Badge>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{name}</h3>
                    <span className="text-sm font-medium text-gray-500">
                        {code}
                    </span>
                </div>

                <Link href={`/venues/${venueId}`}>
                    <p className="text-sm text-blue-600 hover:underline mb-3">
                        {venueName}
                    </p>
                </Link>

                <div className="flex items-center text-gray-600 mb-3">
                    <Info className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">
                        {isIndoor ? "Sân trong nhà" : "Sân ngoài trời"}
                    </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium text-gray-900">
                            {formatCurrency(hourlyRate)}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">/giờ</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                        <Link href={`/courts/${id}`}>
                            <Button
                                variant="outline"
                                className="w-full"
                                size="sm"
                            >
                                Chi tiết
                            </Button>
                        </Link>
                        <Link href={`/booking?court=${id}`}>
                            <Button
                                className="w-full"
                                size="sm"
                                disabled={status !== "available"}
                            >
                                <CalendarDays className="mr-1 h-4 w-4" />
                                Đặt sân
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
