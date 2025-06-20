// client/src/app/(client)/pricing/components/PricingTabs.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dumbbell, Wrench, Gift } from "lucide-react";
import { PricingTab } from "../types/pricingTypes";

interface PricingTabsProps {
    activeTab: PricingTab;
    onTabChange: (tab: PricingTab) => void;
}

export default function PricingTabs({
    activeTab,
    onTabChange,
}: PricingTabsProps) {
    const tabs = [
        {
            id: "courts" as PricingTab,
            label: "Sân thể thao",
            icon: <Dumbbell className="h-5 w-5" />,
            description: "Giá thuê các loại sân",
        },
        {
            id: "services" as PricingTab,
            label: "Dịch vụ khác",
            icon: <Wrench className="h-5 w-5" />,
            description: "Thiết bị, huấn luyện...",
        },
        {
            id: "promotions" as PricingTab,
            label: "Khuyến mãi",
            icon: <Gift className="h-5 w-5" />,
            description: "Ưu đãi đặc biệt",
        },
    ];

    return (
        <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row justify-center gap-4">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={
                                activeTab === tab.id ? "default" : "outline"
                            }
                            size="lg"
                            onClick={() => onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-2 h-auto py-4 px-6 ${
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                            }`}
                        >
                            {tab.icon}
                            <div className="text-center">
                                <div className="font-semibold">{tab.label}</div>
                                <div className="text-xs opacity-80">
                                    {tab.description}
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
}
