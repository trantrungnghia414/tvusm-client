import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
    return (
        <div className="relative min-h-[500px] flex items-center">
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/sportshall.jpg"
                    alt="Nhà thi đấu TVU"
                    fill
                    className="object-cover brightness-50"
                />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 z-10">
                <div className="max-w-3xl text-white">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 max-sm:text-4xl">
                        Nhà Thi Đấu Đại Học Trà Vinh
                    </h1>
                    <p className="text-lg md:text-xl mb-8 text-gray-200">
                        Nơi tổ chức các sự kiện thể thao và hoạt động thể chất
                        cho sinh viên và cộng đồng
                    </p>
                    <div className="flex gap-4">
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                        >
                            Đặt sân ngay
                        </Button>
                        <Button
                         variant="secondary"
                         size="lg"
                         className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 transition-colors hover:cursor-pointer"
                        >
                         Xem lịch sự kiện
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
