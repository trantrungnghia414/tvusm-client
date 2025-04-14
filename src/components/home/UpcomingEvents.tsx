import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const upcomingEvents = [
    {
        id: 1,
        title: "Giải bóng chuyền sinh viên 2024",
        date: "20/04/2024",
        time: "08:00 - 17:00",
        type: "Giải đấu",
    },
    {
        id: 2,
        title: "Hội thao công đoàn TVU",
        date: "25/04/2024",
        time: "07:30 - 16:30",
        type: "Sự kiện",
    },
    // Thêm các sự kiện khác
];

export default function UpcomingEvents() {
    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Sự kiện sắp diễn ra
                    </h2>
                    <Button variant="outline">Xem tất cả</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            className="border rounded-lg p-6 hover:border-blue-500 transition-colors"
                        >
                            <div className="flex items-center gap-2 text-blue-600 mb-4">
                                <Calendar className="w-5 h-5" />
                                <span className="text-sm">{event.date}</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {event.title}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Thời gian: {event.time}
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    {event.type}
                                </span>
                                <Button
                                    variant="link"
                                    className="text-blue-600"
                                >
                                    Chi tiết →
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
