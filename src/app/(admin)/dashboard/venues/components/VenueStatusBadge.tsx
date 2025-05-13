import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface VenueStatusBadgeProps {
    status: "active" | "maintenance" | "inactive";
}

export default function VenueStatusBadge({ status }: VenueStatusBadgeProps) {
    if (status === "active") {
        return (
            <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200 flex items-center"
            >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Đang hoạt động
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
                className="bg-gray-100 text-gray-800 border-gray-200 flex items-center"
            >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Ngừng hoạt động
            </Badge>
        );
    }
}
