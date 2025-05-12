"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import ArenaForm from "@/app/(admin)/dashboard/arenas/components/ArenaForm";

export default function AddArenaPage() {
    const router = useRouter();

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
                        Thêm sân thể thao mới
                    </h1>
                </div>

                <ArenaForm />
            </div>
        </DashboardLayout>
    );
}
