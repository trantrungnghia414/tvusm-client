// client/src/app/(admin)/dashboard/settings/components/MaintenanceSettingsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Wrench, AlertTriangle, Plus, X } from "lucide-react";
import { MaintenanceSettings } from "../types/settingsTypes";
import { toast } from "sonner";

interface MaintenanceSettingsSectionProps {
    settings: MaintenanceSettings;
    onSave: (settings: MaintenanceSettings) => Promise<void>;
    loading?: boolean;
}

export default function MaintenanceSettingsSection({
    settings,
    onSave,
    loading = false,
}: MaintenanceSettingsSectionProps) {
    const [formData, setFormData] = useState<MaintenanceSettings>(settings);
    const [saving, setSaving] = useState(false);
    const [newIp, setNewIp] = useState("");

    const handleInputChange = (field: keyof MaintenanceSettings, value: MaintenanceSettings[keyof MaintenanceSettings]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const addAllowedIp = () => {
        if (!newIp.trim()) return;
        
        // Simple IP validation
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(newIp.trim())) {
            toast.error("Địa chỉ IP không hợp lệ");
            return;
        }

        if (formData.allowed_ips.includes(newIp.trim())) {
            toast.error("IP này đã được thêm");
            return;
        }

        setFormData(prev => ({
            ...prev,
            allowed_ips: [...prev.allowed_ips, newIp.trim()],
        }));
        setNewIp("");
    };

    const removeAllowedIp = (ip: string) => {
        setFormData(prev => ({
            ...prev,
            allowed_ips: prev.allowed_ips.filter(item => item !== ip),
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(formData);
            toast.success("Đã lưu cài đặt bảo trì");
        } catch (error) {
            toast.error("Không thể lưu cài đặt");
            console.error("Error saving maintenance settings:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Cài đặt Bảo trì
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Maintenance Mode */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Chế độ bảo trì</h3>
                            <p className="text-sm text-gray-500">
                                Bật chế độ bảo trì sẽ hiển thị thông báo cho người dùng
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {formData.maintenance_mode && (
                                <Badge variant="destructive">Đang bảo trì</Badge>
                            )}
                            <Switch
                                checked={formData.maintenance_mode}
                                onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
                            />
                        </div>
                    </div>

                    {formData.maintenance_mode && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-red-800">
                                        Chế độ bảo trì đang được bật
                                    </h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        Website sẽ hiển thị thông báo bảo trì cho tất cả người dùng, 
                                        trừ các IP được phép truy cập.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Maintenance Message */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="maintenance_message">Thông báo bảo trì</Label>
                        <Textarea
                            id="maintenance_message"
                            value={formData.maintenance_message}
                            onChange={(e) => handleInputChange("maintenance_message", e.target.value)}
                            placeholder="Hệ thống đang được bảo trì. Vui lòng quay lại sau ít phút."
                            rows={4}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Thông báo này sẽ hiển thị cho người dùng khi hệ thống đang bảo trì
                        </p>
                    </div>
                </div>

                {/* Allowed IPs */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">IP được phép truy cập</h3>
                    <p className="text-sm text-gray-500">
                        Các địa chỉ IP này vẫn có thể truy cập website khi đang bảo trì
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Input
                                value={newIp}
                                onChange={(e) => setNewIp(e.target.value)}
                                placeholder="192.168.1.1"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addAllowedIp();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                onClick={addAllowedIp}
                                variant="outline"
                                size="icon"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {formData.allowed_ips.length > 0 && (
                            <div className="space-y-2">
                                <Label>Danh sách IP được phép:</Label>
                                <div className="flex flex-wrap gap-2">
                                    {formData.allowed_ips.map((ip, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            {ip}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="p-0 w-4 h-4"
                                                onClick={() => removeAllowedIp(ip)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current IP Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                            <h4 className="text-sm font-medium text-blue-800">
                                IP hiện tại của bạn
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Thêm IP này vào danh sách để đảm bảo bạn vẫn có thể truy cập khi bảo trì
                            </p>
                        </div>
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