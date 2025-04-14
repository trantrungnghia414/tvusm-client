import { Calendar, Users, Trophy, Dumbbell } from "lucide-react";

const services = [
    {
        icon: Calendar,
        title: "Đặt sân trực tuyến",
        description:
            "Dễ dàng đặt sân theo giờ với hệ thống đặt lịch trực tuyến",
    },
    {
        icon: Users,
        title: "Tổ chức sự kiện",
        description: "Địa điểm lý tưởng cho các sự kiện thể thao quy mô lớn",
    },
    {
        icon: Trophy,
        title: "Giải đấu thể thao",
        description: "Tổ chức các giải đấu thể thao cho sinh viên và cộng đồng",
    },
    {
        icon: Dumbbell,
        title: "Thiết bị hiện đại",
        description: "Trang bị đầy đủ dụng cụ và thiết bị thể thao hiện đại",
    },
];

export default function ServicesSection() {
    return (
        <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                    Dịch vụ của chúng tôi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <service.icon className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-600">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
