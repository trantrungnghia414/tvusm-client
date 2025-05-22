"use client";

import React from "react";
import Navbar from "./components/layout/Navbar";
import Hero from "@/app/(client)/components/layout/Hero";
import FeaturedVenues from "@/app/(client)/components/home/FeaturedVenues";
import PopularCourts from "@/app/(client)/components/home/PopularCourts";
import UpcomingEvents from "@/app/(client)/components/home/UpcomingEvents";
import Testimonials from "@/app/(client)/components/home/Testimonials";
import CTASection from "@/app/(client)/components/home/CTASection";
import Footer from "@/app/(client)/components/layout/Footer";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Navbar />
            <main>
                <Hero />
                <FeaturedVenues />
                <PopularCourts />
                <UpcomingEvents />
                <Testimonials />
                <CTASection/>
            </main>
            <Footer />
        </div>
    );
}
