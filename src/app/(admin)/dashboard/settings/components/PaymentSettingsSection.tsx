// client/src/app/(admin)/dashboard/settings/components/PaymentSettingsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, CreditCard } from "lucide-react";
import { PaymentSettings } from "../types/settingsTypes";
import { toast } from "sonner";

interface PaymentSettingsSectionProps {
    settings: PaymentSettings;
    onSave: (settings: PaymentSettings) => Promise<void>;
    loading?: boolean;
}

export default function PaymentSettingsSection({
    settings,
    onSave,
    loading = false,
}: PaymentSettingsSectionProps) {
    const [formData, setFormData] = useState<PaymentSettings>(settings);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (field: keyof PaymentSettings, value: string | boolean | string[]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePaymentMethodChange = (method: string, checked: boolean) => {
        const updatedMethods = checked
            ? [...formData.payment_methods, method]
            : formData.payment_methods.filter((m) => m !== method);

        setFormData((prev) => ({
            ...prev,
            payment_methods: updatedMethods,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(formData);
            toast.success("Đã lưu cài đặt thanh toán");
        } catch (error) {
            toast.error("Không thể lưu cài đặt");
            console.error("Error saving payment settings:", error);
        } finally {
            setSaving(false);
        }
    };

    const paymentMethods = [
        {
            id: "cash",
            label: "Tiền mặt",
            description: "Thanh toán bằng tiền mặt tại quầy",
        },
        {
            id: "bank_transfer",
            label: "Chuyển khoản ngân hàng",
            description: "Chuyển khoản qua ngân hàng",
        },
        { id: "vnpay", label: "VNPay", description: "Cổng thanh toán VNPay" },
        { id: "momo", label: "MoMo", description: "Ví điện tử MoMo" },
        { id: "zalopay", label: "ZaloPay", description: "Ví điện tử ZaloPay" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Cài đặt Thanh toán
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Currency */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tiền tệ</h3>
                    <div>
                        <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                        <Input
                            id="currency"
                            value={formData.currency}
                            onChange={(e) =>
                                handleInputChange("currency", e.target.value)
                            }
                            placeholder="VND"
                        />
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                        Phương thức thanh toán
                    </h3>
                    <div className="space-y-3">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className="flex items-start space-x-3"
                            >
                                <Checkbox
                                    id={method.id}
                                    checked={formData.payment_methods.includes(
                                        method.id
                                    )}
                                    onCheckedChange={(checked) =>
                                        handlePaymentMethodChange(
                                            method.id,
                                            checked as boolean
                                        )
                                    }
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor={method.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {method.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {method.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* VNPay Settings */}
                {formData.payment_methods.includes("vnpay") && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">
                                    Cấu hình VNPay
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Cài đặt tích hợp với VNPay
                                </p>
                            </div>
                            <Switch
                                checked={formData.vnpay_enabled}
                                onCheckedChange={(checked) =>
                                    handleInputChange("vnpay_enabled", checked)
                                }
                            />
                        </div>

                        {formData.vnpay_enabled && (
                            <div>
                                <Label htmlFor="vnpay_merchant_id">
                                    VNPay Merchant ID
                                </Label>
                                <Input
                                    id="vnpay_merchant_id"
                                    value={formData.vnpay_merchant_id || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "vnpay_merchant_id",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập Merchant ID"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* MoMo Settings */}
                {formData.payment_methods.includes("momo") && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">
                                    Cấu hình MoMo
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Cài đặt tích hợp với MoMo
                                </p>
                            </div>
                            <Switch
                                checked={formData.momo_enabled}
                                onCheckedChange={(checked) =>
                                    handleInputChange("momo_enabled", checked)
                                }
                            />
                        </div>

                        {formData.momo_enabled && (
                            <div>
                                <Label htmlFor="momo_partner_code">
                                    MoMo Partner Code
                                </Label>
                                <Input
                                    id="momo_partner_code"
                                    value={formData.momo_partner_code || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "momo_partner_code",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập Partner Code"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Bank Transfer Settings */}
                {formData.payment_methods.includes("bank_transfer") && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">
                                    Thông tin chuyển khoản
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Thông tin tài khoản ngân hàng
                                </p>
                            </div>
                            <Switch
                                checked={formData.bank_transfer_enabled}
                                onCheckedChange={(checked) =>
                                    handleInputChange(
                                        "bank_transfer_enabled",
                                        checked
                                    )
                                }
                            />
                        </div>

                        {formData.bank_transfer_enabled && (
                            <div>
                                <Label htmlFor="bank_info">
                                    Thông tin ngân hàng
                                </Label>
                                <Textarea
                                    id="bank_info"
                                    value={formData.bank_info || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "bank_info",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ngân hàng: Vietcombank&#10;Số tài khoản: 1234567890&#10;Chủ tài khoản: Trường Đại học Trà Vinh&#10;Nội dung: [Mã đặt sân] - [Họ tên]"
                                    rows={4}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4" />
                        )}
                        Lưu thay đổi
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
