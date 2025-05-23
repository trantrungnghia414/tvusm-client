"use client";

import CTASection from "@/app/(client)/components/home/CTASection";
import FeaturedVenues from "@/app/(client)/components/home/FeaturedVenues";
import NewsSection from "@/app/(client)/components/home/NewsSection";
import PopularCourts from "@/app/(client)/components/home/PopularCourts";
import StatisticsSection from "@/app/(client)/components/home/StatisticsSection";
import Testimonials from "@/app/(client)/components/home/Testimonials";
import UpcomingEvents from "@/app/(client)/components/home/UpcomingEvents";
import Footer from "@/app/(client)/components/layout/Footer";
import Hero from "@/app/(client)/components/layout/Hero";
import Navbar from "@/app/(client)/components/layout/Navbar";
// import SkeletonLoader from "@/app/(client)/components/shared/SkeletonLoader";
// import React, { useState, useEffect } from "react";
import React from "react";

export default function HomePage() {
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     // Giả lập thời gian tải trang
    //     const timer = setTimeout(() => {
    //         setLoading(false);
    //     }, 1000);

    //     return () => clearTimeout(timer);
    // }, []);

    // if (loading) {
    //     return <SkeletonLoader />;
    // }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <main>
                <Hero />
                <FeaturedVenues />
                <PopularCourts />
                <StatisticsSection />
                <UpcomingEvents />
                <NewsSection />
                <Testimonials />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
