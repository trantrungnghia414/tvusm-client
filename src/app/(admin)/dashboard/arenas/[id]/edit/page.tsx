"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
// import { fetchApi } from "@/lib/api";
// import DashboardLayout from "../../../../components/DashboardLayout";
import ArenaForm from "../../components/ArenaForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Arena } from "../../types/arenaTypes";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function EditArenaPage() {
    const [arena, setArena] = useState<Arena | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const arenaId = params.id as string;

    useEffect(() => {
        const fetchArena = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                // In a real app, you would fetch data from API
                // const response = await fetchApi(`/arenas/${arenaId}`, {
                //   headers: { Authorization: `Bearer ${token}` },
                // });

                // Dummy data for demonstration
                // Simulating an API response with a timeout
                setTimeout(() => {
                    const dummyArena: Arena = {
                        id: parseInt(arenaId),
                        name: "Sân bóng đá TVU",
                        address:
                            "Trường Đại học Trà Vinh, Phường 4, TP. Trà Vinh",
                        description:
                            "Sân bóng đá cỏ nhân tạo với tiêu chuẩn FIFA.",
                        type: "football",
                        status: "active",
                        images: [
                            "/images/stadiums/football1.jpg",
                            "/images/stadiums/football2.jpg",
                        ],
                        price_per_hour: 300000,
                        open_time: "06:00",
                        close_time: "22:00",
                        created_at: "2023-01-15T07:00:00Z",
                        updated_at: "2023-04-10T08:30:00Z",
                        sub_arenas: [
                            {
                                id: 1,
                                name: "Sân bóng đá 5A",
                                type: "football_5",
                                status: "active",
                            },
                            {
                                id: 2,
                                name: "Sân bóng đá 5B",
                                type: "football_5",
                                status: "maintenance",
                            },
                            {
                                id: 3,
                                name: "Sân bóng đá 7",
                                type: "football_7",
                                status: "active",
                            },
                        ],
                        features: [
                            "Đèn chiếu sáng",
                            "Vòi tắm",
                            "Phòng thay đồ",
                            "Chỗ để xe",
                        ],
                        rules: [
                            "Không hút thuốc",
                            "Không mang thức ăn vào sân",
                        ],
                    };

                    setArena(dummyArena);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error fetching arena:", error);
                toast.error("Không thể tải thông tin sân");
                setLoading(false);
            }
        };

        if (arenaId) {
            fetchArena();
        }
    }, [arenaId, router]);

    return (
        <DashboardLayout activeTab="arenas">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Chỉnh sửa sân thể thao
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : arena ? (
                    <ArenaForm arena={arena} isEditMode={true} />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-red-500">
                            Không tìm thấy sân thể thao này
                        </p>
                        <Button onClick={() => router.back()} className="mt-4">
                            Quay lại
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
