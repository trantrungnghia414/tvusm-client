"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Calendar,
    Hash,
    Users,
} from "lucide-react";

interface CourtDetailProps {
    court: {
        code: string;
        surface_type?: string;
        length?: number;
        width?: number;
        hourly_rate: number;
        booking_count?: number;
        is_indoor: boolean;
    };
}

export default function CourtDetail({ court }: CourtDetailProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2">
            <h2 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-md">
                        <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Mã sân</p>
                        <p className="font-medium">{court.code}</p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-50 rounded-md">
                        <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Giá thuê (giờ)
                        </p>
                        <p className="font-medium text-green-600">
                            {formatCurrency(court.hourly_rate)}
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-red-50 rounded-md">
                        <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Loại sân</p>
                        <Badge
                            variant="outline"
                            className={
                                court.is_indoor
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                            }
                        >
                            {court.is_indoor
                                ? "Sân trong nhà"
                                : "Sân ngoài trời"}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-md">
                        <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Lượt đặt sân
                        </p>
                        <p className="font-medium">
                            {court.booking_count || 0} lượt
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
