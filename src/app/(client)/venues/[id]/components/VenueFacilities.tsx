"use client";

import { CheckCircle } from "lucide-react";

interface VenueFacilitiesProps {
    facilities: string[];
}

export default function VenueFacilities({ facilities }: VenueFacilitiesProps) {
    if (!facilities || facilities.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Không có thông tin về tiện ích</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-bold mb-6">Tiện ích có sẵn</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {facilities.map((facility, index) => (
                        <div key={index} className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                            <span>{facility}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
