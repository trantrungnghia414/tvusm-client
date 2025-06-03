"use client";

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Calendar,
    Ruler,
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

                {court.surface_type && (
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-50 rounded-md">
                            <div className="h-5 w-5 text-purple-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Bề mặt</p>
                            <p className="font-medium">{court.surface_type}</p>
                        </div>
                    </div>
                )}

                {(court.length || court.width) && (
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-50 rounded-md">
                            <Ruler className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">
                                Kích thước
                            </p>
                            <p className="font-medium">
                                {court.length && court.width
                                    ? `${court.length}m x ${court.width}m`
                                    : "Không xác định"}
                            </p>
                        </div>
                    </div>
                )}

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
