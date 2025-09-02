"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Phone, Mail, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import CustomerHistoryModal from "./CustomerHistoryModal";

interface CustomerData {
    customer: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        phone?: string;
    };
    bookingCount: number;
    totalSpent: number;
    lastBooking: string;
}

interface CustomerTableProps {
    customers: CustomerData[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerData | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getCustomerLevel = (totalSpent: number) => {
        if (totalSpent >= 10000000)
            return { label: "VIP", color: "bg-purple-100 text-purple-800" };
        if (totalSpent >= 5000000)
            return { label: "Vàng", color: "bg-yellow-100 text-yellow-800" };
        if (totalSpent >= 2000000)
            return { label: "Bạc", color: "bg-gray-100 text-gray-800" };
        return { label: "Đồng", color: "bg-orange-100 text-orange-800" };
    };

    if (!customers || customers.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-gray-500">
                Không có dữ liệu khách hàng
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead className="text-center">Lượt đặt</TableHead>
                        <TableHead className="text-right">
                            Tổng chi tiêu
                        </TableHead>
                        <TableHead className="text-center">Hạng</TableHead>
                        <TableHead className="text-center">Lần cuối</TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => {
                        const level = getCustomerLevel(customer.totalSpent);

                        return (
                            <TableRow key={customer.customer.user_id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {customer.customer.fullname ||
                                                    customer.customer.username}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                @{customer.customer.username}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span
                                                className="truncate max-w-40"
                                                title={customer.customer.email}
                                            >
                                                {customer.customer.email}
                                            </span>
                                        </div>
                                        {customer.customer.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>
                                                    {customer.customer.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="font-semibold text-lg">
                                        {customer.bookingCount}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        lượt
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-semibold text-lg">
                                        {formatCurrency(customer.totalSpent)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        TB:{" "}
                                        {formatCurrency(
                                            customer.totalSpent /
                                                customer.bookingCount
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge className={level.color}>
                                        {level.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="text-sm">
                                        {formatDate(customer.lastBooking)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedCustomer(
                                                        customer
                                                    )
                                                }
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Lịch sử đặt sân -{" "}
                                                    {customer.customer
                                                        .fullname ||
                                                        customer.customer
                                                            .username}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Xem chi tiết lịch sử đặt sân
                                                    và giao dịch của khách hàng
                                                </DialogDescription>
                                            </DialogHeader>
                                            {selectedCustomer && (
                                                <CustomerHistoryModal
                                                    customer={selectedCustomer}
                                                />
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {customers.length >= 10 && (
                <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-500">
                        Hiển thị top 10 khách hàng hàng đầu. Sử dụng bộ lọc để
                        xem thêm chi tiết.
                    </p>
                </div>
            )}
        </div>
    );
}
