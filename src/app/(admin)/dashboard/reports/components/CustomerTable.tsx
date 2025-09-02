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
import { ChevronDown, ChevronUp, Phone, Mail, User } from "lucide-react";
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
    const [expandedCustomer, setExpandedCustomer] = useState<number | null>(
        null
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
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
                        <TableHead className="text-center">Lần cuối</TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => {
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
                                    <div className="text-sm">
                                        {formatDate(customer.lastBooking)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() =>
                                            setExpandedCustomer(
                                                expandedCustomer ===
                                                    customer.customer.user_id
                                                    ? null
                                                    : customer.customer.user_id
                                            )
                                        }
                                    >
                                        {expandedCustomer ===
                                        customer.customer.user_id ? (
                                            <>
                                                <span className="text-xs">
                                                    Ẩn
                                                </span>
                                                <ChevronUp className="h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs">
                                                    Xem lịch sử
                                                </span>
                                                <ChevronDown className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Expanded Customer History */}
            {expandedCustomer && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">
                                Lịch sử đặt sân -{" "}
                                {customers.find(
                                    (c) =>
                                        c.customer.user_id === expandedCustomer
                                )?.customer.fullname ||
                                    customers.find(
                                        (c) =>
                                            c.customer.user_id ===
                                            expandedCustomer
                                    )?.customer.username}
                            </h3>
                        </div>
                        <div className="text-sm text-gray-500">
                            💡 Chi tiết được hiển thị bên dưới
                        </div>
                    </div>
                    <CustomerHistoryModal
                        customer={
                            customers.find(
                                (c) => c.customer.user_id === expandedCustomer
                            )!
                        }
                    />
                </div>
            )}

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
