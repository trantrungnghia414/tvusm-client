import { formatCurrency } from "@/lib/utils";
import { EquipmentStats as EquipmentStatsType } from "../types/equipmentTypes";
import { Card, CardContent } from "@/components/ui/card";
import {
    Box,
    CheckCircle,
    DollarSign,
    Settings,
    Wrench, // Sửa từ ToolIcon thành Tool
    AlertTriangle, // Sửa từ AlertTriangleIcon thành AlertTriangle
} from "lucide-react";

interface EquipmentStatsProps {
    stats: EquipmentStatsType;
}

export default function EquipmentStats({ stats }: EquipmentStatsProps) {
    const statItems = [
        {
            title: "Tổng số thiết bị",
            value: stats.total,
            icon: Box,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Có sẵn",
            value: stats.available,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Đang sử dụng",
            value: stats.in_use,
            icon: Settings,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50",
        },
        {
            title: "Đang bảo trì",
            value: stats.maintenance,
            icon: Wrench,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
        },
        {
            title: "Không khả dụng",
            value: stats.unavailable,
            icon: AlertTriangle,
            color: "text-gray-600",
            bgColor: "bg-gray-100",
        },
        {
            title: "Tổng giá trị",
            value: formatCurrency(Number(stats.total_value) || 0),
            icon: DollarSign,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            isNumber: false,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {statItems.map((item, index) => (
                <Card key={index} className="border">
                    <CardContent className="p-4 flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${item.bgColor}`}>
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm text-gray-500">
                                {item.title}
                            </p>
                            <p className="text-xl font-semibold">
                                {item.value}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
