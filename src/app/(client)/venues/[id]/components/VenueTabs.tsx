"use client";

import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import VenueCourts from "./VenueCourts";
import VenueEvents from "./VenueEvents";
import VenueFacilities from "./VenueFacilities";
import VenueGallery from "./VenueGallery";

interface VenueTabsProps {
    venueId: number;
    facilities?: string[];
    gallery?: string[];
    onEventCountChange?: (count: number) => void;
    isLoading?: boolean;
    initialActiveTab?: string;
}

export default function VenueTabs({
    venueId,
    facilities = [],
    gallery = [],
    onEventCountChange,
    isLoading = false,
    initialActiveTab = "sân thi đấu",
}: VenueTabsProps) {
    const [activeTab, setActiveTab] = useState(initialActiveTab);
    const [tabContentLoading, setTabContentLoading] = useState(false);

    const handleTabChange = (tab: string) => {
        setTabContentLoading(true);
        setActiveTab(tab);
        setTabContentLoading(false);
    };

    if (isLoading) {
        return (
            <>
                {/* Skeleton cho tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200 flex overflow-x-auto no-scrollbar">
                        <div className="flex space-x-2 md:space-x-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="py-4 px-2 animate-pulse"
                                >
                                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Skeleton cho tab content */}
                <div className="mb-16 animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg shadow-md overflow-hidden h-64"
                            >
                                <div className="bg-gray-300 h-40 w-full"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Tabs Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-200 flex overflow-x-auto no-scrollbar">
                    <div className="flex space-x-2 md:space-x-8">
                        {["Sân thi đấu", "Sự kiện", "Tiện ích", "Hình ảnh"].map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() =>
                                        handleTabChange(tab.toLowerCase())
                                    }
                                    className={`
                                    relative py-4 px-2 whitespace-nowrap font-medium text-base transition-colors
                                    ${
                                        activeTab === tab.toLowerCase()
                                            ? "text-blue-600"
                                            : "text-gray-600 hover:text-gray-900"
                                    }
                                `}
                                >
                                    {tab}
                                    {activeTab === tab.toLowerCase() && (
                                        <span className="absolute h-1 bg-blue-600 bottom-0 left-0 right-0 rounded-t-md"></span>
                                    )}
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="mb-16">
                {tabContentLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                        <span>Đang tải nội dung...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === "sân thi đấu" && (
                            <Suspense
                                fallback={
                                    <div className="flex justify-center items-center py-20">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                                        <span>Đang tải danh sách sân...</span>
                                    </div>
                                }
                            >
                                <VenueCourts
                                    key="venue-courts"
                                    venueId={venueId}
                                />
                            </Suspense>
                        )}

                        {activeTab === "sự kiện" && (
                            <Suspense
                                fallback={
                                    <div className="flex justify-center items-center py-20">
                                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                                        <span>
                                            Đang tải danh sách sự kiện...
                                        </span>
                                    </div>
                                }
                            >
                                <VenueEvents
                                    key="venue-events"
                                    venueId={venueId}
                                    onEventCountChange={onEventCountChange}
                                />
                            </Suspense>
                        )}

                        {activeTab === "tiện ích" && (
                            <VenueFacilities
                                key="venue-facilities"
                                facilities={facilities}
                            />
                        )}

                        {activeTab === "hình ảnh" && (
                            <VenueGallery
                                key="venue-gallery"
                                images={gallery}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
}
