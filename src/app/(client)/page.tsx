"use client";

import CTASection from "@/app/(client)/components/home/CTASection";
// import FeaturedVenues from "@/app/(client)/components/home/FeaturedVenues";
import NewsSection from "@/app/(client)/components/home/NewsSection";
import PopularCourts from "@/app/(client)/components/home/PopularCourts";
// import StatisticsSection from "@/app/(client)/components/home/StatisticsSection";
// import Testimonials from "@/app/(client)/components/home/Testimonials";
import UpcomingEvents from "@/app/(client)/components/home/UpcomingEvents";
import Footer from "@/app/(client)/components/layout/Footer";
import Hero from "@/app/(client)/components/layout/Hero";
import Navbar from "@/app/(client)/components/layout/Navbar";
import React from "react";

export default function HomePage() {

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <main>
                <Hero />
                <PopularCourts />
                {/* <FeaturedVenues /> */}
                {/* <StatisticsSection /> */}
                <UpcomingEvents />
                <NewsSection />
                {/* <Testimonials /> */}
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
