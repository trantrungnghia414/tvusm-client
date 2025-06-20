"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PaymentMethodsProps {
    selectedMethod: string;
    onMethodChange: (method: string) => void;
}

export default function PaymentMethods({
    selectedMethod,
    onMethodChange,
}: PaymentMethodsProps) {
    return (
        <RadioGroup
            value={selectedMethod}
            onValueChange={onMethodChange}
            className="space-y-3"
        >
            <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <RadioGroupItem value="cash" id="cash" />
                <Label className="flex flex-1 cursor-pointer" htmlFor="cash">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 text-green-600"
                            >
                                <rect
                                    width="20"
                                    height="12"
                                    x="2"
                                    y="6"
                                    rx="2"
                                />
                                <circle cx="12" cy="12" r="2" />
                                <path d="M6 12h.01M18 12h.01" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">Thanh toán tiền mặt</p>
                            <p className="text-gray-600 text-sm">
                                Thanh toán trực tiếp khi đến sân
                            </p>
                        </div>
                    </div>
                </Label>
            </div>

            <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label
                    className="flex flex-1 cursor-pointer"
                    htmlFor="transfer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 text-blue-600"
                            >
                                <rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="5"
                                    rx="2"
                                />
                                <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">
                                Chuyển khoản ngân hàng
                            </p>
                            <p className="text-gray-600 text-sm">
                                Chuyển khoản trước hoặc sau khi đặt sân
                            </p>
                        </div>
                    </div>
                </Label>
            </div>

            <div className="flex items-center space-x-2 border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors opacity-60">
                <RadioGroupItem value="vnpay" id="vnpay" disabled />
                <Label className="flex flex-1 cursor-pointer" htmlFor="vnpay">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 text-red-600"
                            >
                                <rect
                                    width="20"
                                    height="14"
                                    x="2"
                                    y="5"
                                    rx="2"
                                />
                                <line x1="2" x2="22" y1="10" y2="10" />
                                <path d="M7 15h.01M11 15h2" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium">VNPay</p>
                            <p className="text-gray-600 text-sm">
                                Thanh toán trực tuyến qua VNPay (Đang phát
                                triển)
                            </p>
                        </div>
                    </div>
                </Label>
            </div>
        </RadioGroup>
    );
}
