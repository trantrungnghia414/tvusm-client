import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ArenaStatusProps {
    status: "active" | "maintenance" | "inactive";
}

export default function ArenaStatus({ status }: ArenaStatusProps) {
    switch (status) {
        case "active":
            return (
                <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700 text-sm">Hoạt động</span>
                </div>
            );
        case "maintenance":
            return (
                <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-700 text-sm">Đang bảo trì</span>
                </div>
            );
        case "inactive":
            return (
                <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-700 text-sm">
                        Không hoạt động
                    </span>
                </div>
            );
        default:
            return null;
    }
}
