// trang sự kiện
"use client";

import React, { useState } from "react";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import EventBanner from "./components/EventBanner";
import useEvents from "./hooks/useEvents";
import EventSearch from "@/app/(client)/events/components/EventSearch";
import EventFilter from "@/app/(client)/events/components/EventFilter";
import EventList from "@/app/(client)/events/components/EventList";

export default function EventsPage() {
    const [filters, setFilters] = useState({
        status: "all", // all, upcoming, ongoing, completed
        type: "all", // all, competition, training, friendly, etc.
        venue: "all",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("start_date"); // start_date, popularity

    const { events, loading, error } = useEvents({
        filters,
        searchTerm,
        sortBy,
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main>
                <EventBanner />

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Sự kiện
                            </h1>
                            <p className="text-gray-600">
                                Khám phá các sự kiện thể thao hấp dẫn
                            </p>
                        </div>

                        <EventSearch
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                            className="w-full md:w-80"
                        />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar với các bộ lọc */}
                        <div className="w-full lg:w-72 shrink-0">
                            <EventFilter
                                filters={filters}
                                onChange={setFilters}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>

                        {/* Danh sách sự kiện */}
                        <div className="flex-1">
                            <EventList
                                events={events}
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
