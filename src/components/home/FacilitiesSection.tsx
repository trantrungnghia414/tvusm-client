import Image from "next/image";
import { Button } from "@/components/ui/button";

const facilities = [
    {
        id: 1,
        title: "Sân bóng chuyền",
        image: "/images/bongro.jpg",
        description:
            "Sân bóng chuyền tiêu chuẩn quốc tế với hệ thống chiếu sáng hiện đại",
        capacity: "Sức chứa: 500 người",
    },
    {
        id: 2,
        title: "Sân cầu lông",
        image: "/images/bongro.jpg",
        description:
            "4 sân cầu lông đạt chuẩn thi đấu với mặt sân cao su tổng hợp",
        capacity: "4 sân tiêu chuẩn",
    },
    {
        id: 3,
        title: "Phòng tập Gym",
        image: "/images/bongro.jpg",
        description: "Trang bị đầy đủ các thiết bị tập luyện hiện đại",
        capacity: "Diện tích: 200m²",
    },
];

export default function FacilitiesSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Cơ sở vật chất
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Nhà thi đấu được trang bị đầy đủ các cơ sở vật chất hiện
                        đại, đáp ứng nhu cầu tập luyện và thi đấu của sinh viên
                        và cộng đồng
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {facilities.map((facility) => (
                        <div
                            key={facility.id}
                            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-48">
                                <Image
                                    src={facility.image}
                                    alt={facility.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">
                                    {facility.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {facility.description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        {facility.capacity}
                                    </span>
                                    <Button
                                        variant="link"
                                        className="text-blue-600"
                                    >
                                        Xem chi tiết →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
