import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CourtStatusBadgeProps {
    status: "available" | "booked" | "maintenance";
}

export default function CourtStatusBadge({ status }: CourtStatusBadgeProps) {
    if (status === "available") {
        return (
            <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200 flex items-center"
            >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Sẵn sàng sử dụng
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
                className="bg-blue-100 text-blue-800 border-blue-200 flex items-center"
            >
                <AlertCircle className="mr-1 h-3 w-3" />
                Đã đặt
            </Badge>
        );
    }
}
