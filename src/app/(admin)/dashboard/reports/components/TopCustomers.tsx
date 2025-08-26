"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Phone, Mail, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface TopCustomer {
    customer_id: number;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    total_bookings: number;
    total_revenue: number;
    last_booking_date: string;
}

interface TopCustomersProps {
    customers: TopCustomer[];
    onViewCustomer?: (customerId: number) => void;
}

export default function TopCustomers({
    customers,
    onViewCustomer,
}: TopCustomersProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Khách hàng VIP
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {customers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Chưa có dữ liệu khách hàng
                            </p>
                        </div>
                    ) : (
                        customers.map((customer, index) => (
                            <div
                                key={customer.customer_id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-white">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {customer.customer_name}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-sm text-gray-600">
                                                {customer.total_bookings} lần
                                                đặt
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {format(
                                                    parseISO(
                                                        customer.last_booking_date
                                                    ),
                                                    "dd/MM/yyyy",
                                                    { locale: vi }
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            {customer.customer_phone && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Phone className="h-3 w-3" />
                                                    <span>
                                                        {
                                                            customer.customer_phone
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {customer.customer_email && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span>
                                                        {
                                                            customer.customer_email
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600 text-lg">
                                        {formatCurrency(customer.total_revenue)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatCurrency(
                                            customer.total_revenue /
                                                customer.total_bookings
                                        )}
                                        /lần
                                    </p>
                                    {onViewCustomer && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() =>
                                                onViewCustomer(
                                                    customer.customer_id
                                                )
                                            }
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Xem
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {customers.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Tổng khách hàng
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {customers.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Tổng đặt sân
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                    {customers.reduce(
                                        (sum, c) => sum + c.total_bookings,
                                        0
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Tổng doanh thu
                                </p>
                                <p className="text-lg font-bold text-purple-600">
                                    {formatCurrency(
                                        customers.reduce(
                                            (sum, c) => sum + c.total_revenue,
                                            0
                                        )
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
