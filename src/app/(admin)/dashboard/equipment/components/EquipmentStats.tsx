import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, AlertTriangle, Wrench, X } from "lucide-react";
import { EquipmentStats as StatsType } from "../types/equipmentTypes";

interface EquipmentStatsProps {
    stats: StatsType;
}

export default function EquipmentStats({ stats }: EquipmentStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Tổng thiết bị
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {stats.totalEquipment}
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Sẵn sàng
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {stats.availableEquipment}
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Đang sử dụng
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {stats.inUseEquipment}
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Đang bảo trì
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {stats.maintenanceEquipment}
                        </div>
                        <div className="p-2 bg-orange-100 rounded-full">
                            <Wrench className="h-5 w-5 text-orange-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Không khả dụng
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                            {stats.unavailableEquipment}
                        </div>
                        <div className="p-2 bg-red-100 rounded-full">
                            <X className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
