"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import { Venue } from "../../types/venueTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import VenueForm from "@/app/(admin)/dashboard/venues/components/VenueForm";
// import VenueForm from "../../components/VenueForm";
// import LoadingSpinner from "@/components/LoadingSpinner";

export default function EditVenuePage() {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const venueId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/venues/${venueId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin nhà thi đấu");
                }

                const venueData = await response.json();
                setVenue(venueData);
            } catch (error) {
                console.error("Error fetching venue:", error);
                toast.error("Không thể tải thông tin nhà thi đấu");
                router.push("/dashboard/venues");
            } finally {
                setLoading(false);
            }
        };

        fetchVenue();
    }, [venueId, router]);

    const handleSubmit = async (formData: FormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/venues/${venueId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật nhà thi đấu"
                );
            }

            toast.success("Cập nhật nhà thi đấu thành công");
            router.push("/dashboard/venues");
        } catch (error) {
            console.error("Error updating venue:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật nhà thi đấu"
            );
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="venues">
                <LoadingSpinner message="Đang tải thông tin nhà thi đấu..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="venues">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Chỉnh sửa nhà thi đấu</h1>

                {venue ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <VenueForm venue={venue} onSubmit={handleSubmit} />
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p>Không tìm thấy thông tin nhà thi đấu</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
