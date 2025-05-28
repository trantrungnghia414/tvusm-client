import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

type StatusType = "available" | "in_use" | "maintenance" | "unavailable";

interface EquipmentStatusBadgeProps {
    status: StatusType;
}

export default function EquipmentStatusBadge({
    status,
}: EquipmentStatusBadgeProps) {
    if (status === "available") {
        return (
            <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200 flex items-center"
            >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Khả dụng
            </Badge>
        );
    } else if (status === "in_use") {
        return (
            <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-200 flex items-center"
            >
                <Clock className="mr-1 h-3 w-3" />
                Đang sử dụng
            </Badge>
        );
    } else if (status === "maintenance") {
        return (
            <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center"
            >
                <Clock className="mr-1 h-3 w-3" />
                Đang bảo trì
            </Badge>
        );
    } else {
        return (
            <Badge
                variant="outline"
                className="bg-red-100 text-red-800 border-red-200 flex items-center"
            >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Không khả dụng
            </Badge>
        );
    }
}
