"use client";

import { Check } from "lucide-react";

interface CourtFeaturesProps {
    features: string[];
}

export default function CourtFeatures({ features }: CourtFeaturesProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6">Tiện nghi và đặc điểm</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
