// client/src/app/(admin)/dashboard/settings/components/BookingSettingsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { BookingSettings } from "../types/settingsTypes";
import { toast } from "sonner";

interface BookingSettingsSectionProps {
    settings: BookingSettings;
    onSave: (settings: BookingSettings) => Promise<void>;
    loading?: boolean;
}

export default function BookingSettingsSection({
    settings,
    onSave,
    loading = false,
}: BookingSettingsSectionProps) {
    const [formData, setFormData] = useState<BookingSettings>(settings);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (field: keyof BookingSettings, value: number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(formData);
            toast.success("Đã lưu cài đặt đặt sân");
        } catch (error) {
            toast.error("Không thể lưu cài đặt");
            console.error("Error saving booking settings:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cài đặt đặt sân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Booking Limits */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Giới hạn đặt sân</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="max_advance_days">Đặt trước tối đa (ngày)</Label>
                            <Input
                                id="max_advance_days"
                                type="number"
                                min="1"
                                value={formData.max_advance_days}
                                onChange={(e) => handleInputChange("max_advance_days", parseInt(e.target.value))}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Khách hàng có thể đặt sân trước tối đa bao nhiêu ngày
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="min_advance_hours">Đặt trước tối thiểu (giờ)</Label>
                            <Input
                                id="min_advance_hours"
                                type="number"
                                min="0"
                                value={formData.min_advance_hours}
                                onChange={(e) => handleInputChange("min_advance_hours", parseInt(e.target.value))}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Thời gian tối thiểu trước khi đặt sân
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="max_booking_duration">Thời gian đặt tối đa (giờ)</Label>
                            <Input
                                id="max_booking_duration"
                                type="number"
                                min="1"
                                value={formData.max_booking_duration}
                                onChange={(e) => handleInputChange("max_booking_duration", parseInt(e.target.value))}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Thời lượng đặt sân tối đa cho một lần
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="cancellation_deadline_hours">Hạn hủy (giờ)</Label>
                            <Input
                                id="cancellation_deadline_hours"
                                type="number"
                                min="0"
                                value={formData.cancellation_deadline_hours}
                                onChange={(e) => handleInputChange("cancellation_deadline_hours", parseInt(e.target.value))}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Thời gian trước khi có thể hủy đặt sân
                            </p>
                        </div>
                    </div>
                </div>

                {/* Automation */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tự động hóa</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="auto_confirmation">Tự động xác nhận đặt sân</Label>
                                <p className="text-sm text-gray-500">
                                    Đặt sân sẽ được xác nhận tự động mà không cần duyệt thủ công
                                </p>
                            </div>
                            <Switch
                                id="auto_confirmation"
                                checked={formData.auto_confirmation}
                                onCheckedChange={(checked) => handleInputChange("auto_confirmation", checked)}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Thanh toán</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="require_deposit">Yêu cầu đặt cọc</Label>
                                <p className="text-sm text-gray-500">
                                    Khách hàng phải đặt cọc khi đặt sân
                                </p>
                            </div>
                            <Switch
                                id="require_deposit"
                                checked={formData.require_deposit}
                                onCheckedChange={(checked) => handleInputChange("require_deposit", checked)}
                            />
                        </div>

                        {formData.require_deposit && (
                            <div>
                                <Label htmlFor="deposit_percentage">Phần trăm đặt cọc (%)</Label>
                                <Input
                                    id="deposit_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.deposit_percentage}
                                    onChange={(e) => handleInputChange("deposit_percentage", parseInt(e.target.value))}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Phần trăm số tiền cần đặt cọc so với tổng giá trị
                                </p>
                            </div>
                        )}
                    </div>
                </div>

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
                            <Save className="w-4 h-4" />
                        )}
                        Lưu thay đổi
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}