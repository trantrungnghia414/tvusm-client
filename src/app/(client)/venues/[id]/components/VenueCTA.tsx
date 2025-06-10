import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VenueCTAProps {
    venueId?: number;
    title?: string;
    description?: string;
}

export default function VenueCTA({
    venueId,
    title = "Quan tâm đến nhà thi đấu này?",
    description = "Đặt sân ngay hôm nay để có trải nghiệm thể thao tuyệt vời cùng bạn bè và đồng đội!",
}: VenueCTAProps) {
    // Xây dựng URL đặt sân, thêm venue_id nếu có
    const bookingUrl = venueId ? `/booking?venue_id=${venueId}` : "/booking";

    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden mb-16">
            <div className="relative">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="p-8 md:p-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between relative">
                    <div className="mb-6 md:mb-0 md:mr-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {title}
                        </h2>
                        <p className="text-blue-100 text-lg max-w-lg">
                            {description}
                        </p>
                    </div>
                    <Link href={bookingUrl}>
                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <CalendarDays className="mr-2 h-5 w-5" />
                            Đặt sân ngay
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
