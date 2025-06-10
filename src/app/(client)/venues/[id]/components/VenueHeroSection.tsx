"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, CalendarDays, Star, Share2 } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface VenueHeroSectionProps {
    venue: {
        venue_id: number;
        name: string;
        location: string;
        status: string;
        image?: string;
    };
    statusBadge: React.ReactNode;
    handleShare: () => void;
}

export default function VenueHeroSection({
    venue,
    statusBadge,
    handleShare,
}: VenueHeroSectionProps) {
    const router = useRouter();

    return (
        <div
            id="venue-hero-section"
            className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden"
        >
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${getImageUrl(venue.image || "")})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 pointer-events-none"></div>

            {/* Breadcrumbs */}
            <div className="absolute top-6 pt-16 left-0 w-full z-10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center text-white/80 text-sm">
                        <Link
                            href="/"
                            className="hover:text-white transition-colors hover:underline"
                        >
                            Trang chủ
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <Link
                            href="/venues"
                            className="hover:text-white transition-colors hover:underline"
                        >
                            Nhà thi đấu
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="text-white font-medium truncate max-w-[180px]">
                            {venue.name}
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 flex items-end">
                <div className="container mx-auto px-4 pb-16 md:pb-20">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {statusBadge}
                        <div className="flex items-center gap-1 bg-yellow-400/90 text-yellow-900 px-2.5 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">4.8</span>
                            <span className="text-sm">(24 đánh giá)</span>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        onClick={handleShare}
                                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                                    >
                                        <Share2 className="h-4 w-4 text-white" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Chia sẻ</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
                        {venue.name}
                    </h1>
                    <div className="flex items-center text-white mb-6">
                        <MapPin className="h-5 w-5 mr-2" />
                        <p className="text-lg md:text-xl">{venue.location}</p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() =>
                            router.push(`/booking?venue_id=${venue.venue_id}`)
                        }
                    >
                        <CalendarDays className="mr-2 h-5 w-5" />
                        Đặt sân ngay
                    </Button>
                </div>
            </div>
        </div>
    );
}
