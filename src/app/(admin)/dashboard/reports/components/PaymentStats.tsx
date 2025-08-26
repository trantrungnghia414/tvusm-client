"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Wallet, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentMethodStats {
    payment_method: string;
    total_amount: number;
    transaction_count: number;
    percentage: number;
}

interface PaymentStatsProps {
    paymentMethods: PaymentMethodStats[];
}

export default function PaymentStats({ paymentMethods }: PaymentStatsProps) {
    // Get payment method icon
    const getPaymentIcon = (method: string) => {
        const lowerMethod = method.toLowerCase();
        if (lowerMethod.includes("mặt") || lowerMethod.includes("cash")) {
            return <Banknote className="h-4 w-4" />;
        }
        if (lowerMethod.includes("chuyển") || lowerMethod.includes("bank")) {
            return <CreditCard className="h-4 w-4" />;
        }
        if (lowerMethod.includes("ví") || lowerMethod.includes("wallet")) {
            return <Wallet className="h-4 w-4" />;
        }
        return <DollarSign className="h-4 w-4" />;
    };

    // Get payment method color
    const getPaymentColor = (method: string, index: number) => {
        const colors = [
            {
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-700",
                progress: "bg-blue-500",
            },
            {
                bg: "bg-green-50",
                border: "border-green-200",
                text: "text-green-700",
                progress: "bg-green-500",
            },
            {
                bg: "bg-purple-50",
                border: "border-purple-200",
                text: "text-purple-700",
                progress: "bg-purple-500",
            },
            {
                bg: "bg-orange-50",
                border: "border-orange-200",
                text: "text-orange-700",
                progress: "bg-orange-500",
            },
        ];
        return colors[index % colors.length];
    };

    const totalAmount = paymentMethods.reduce(
        (sum, method) => sum + method.total_amount,
        0
    );
    const totalTransactions = paymentMethods.reduce(
        (sum, method) => sum + method.transaction_count,
        0
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Thống kê thanh toán
                </CardTitle>
            </CardHeader>
            <CardContent>
                {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            Chưa có dữ liệu thanh toán
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paymentMethods.map((method, index) => {
                            const colors = getPaymentColor(
                                method.payment_method,
                                index
                            );
                            return (
                                <div
                                    key={method.payment_method}
                                    className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`p-2 rounded-full ${colors.bg}`}
                                            >
                                                {getPaymentIcon(
                                                    method.payment_method
                                                )}
                                            </div>
                                            <h4
                                                className={`font-semibold ${colors.text}`}
                                            >
                                                {method.payment_method}
                                            </h4>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="font-bold"
                                        >
                                            {method.percentage.toFixed(1)}%
                                        </Badge>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${colors.progress}`}
                                                style={{
                                                    width: `${method.percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="bg-white p-3 rounded border">
                                            <p className="text-gray-600 mb-1">
                                                Tổng tiền
                                            </p>
                                            <p
                                                className={`font-bold ${colors.text}`}
                                            >
                                                {formatCurrency(
                                                    method.total_amount
                                                )}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border">
                                            <p className="text-gray-600 mb-1">
                                                Số giao dịch
                                            </p>
                                            <p
                                                className={`font-bold ${colors.text}`}
                                            >
                                                {method.transaction_count.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border md:col-span-1 col-span-2">
                                            <p className="text-gray-600 mb-1">
                                                TB/giao dịch
                                            </p>
                                            <p
                                                className={`font-bold ${colors.text}`}
                                            >
                                                {formatCurrency(
                                                    method.total_amount /
                                                        method.transaction_count
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary */}
                {paymentMethods.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4">
                            Tổng quan
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">
                                    Tổng doanh thu
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">
                                    Tổng giao dịch
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                    {totalTransactions.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">
                                    TB/giao dịch
                                </p>
                                <p className="text-lg font-bold text-purple-600">
                                    {formatCurrency(
                                        totalAmount / totalTransactions
                                    )}
                                </p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">
                                    Phương thức
                                </p>
                                <p className="text-lg font-bold text-orange-600">
                                    {paymentMethods.length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
