// client/src/app/(admin)/dashboard/settings/components/SecuritySettingsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Shield, AlertTriangle } from "lucide-react";
import { SecuritySettings } from "../types/settingsTypes";
import { toast } from "sonner";

interface SecuritySettingsSectionProps {
    settings: SecuritySettings;
    onSave: (settings: SecuritySettings) => Promise<void>;
    loading?: boolean;
}

export default function SecuritySettingsSection({
    settings,
    onSave,
    loading = false,
}: SecuritySettingsSectionProps) {
    const [formData, setFormData] = useState<SecuritySettings>(settings);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (field: keyof SecuritySettings, value: number | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(formData);
            toast.success("Đã lưu cài đặt bảo mật");
        } catch (error) {
            toast.error("Không thể lưu cài đặt");
            console.error("Error saving security settings:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Cài đặt Bảo mật
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Password Policy */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Chính sách mật khẩu</h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="password_min_length">
                                Độ dài tối thiểu
                            </Label>
                            <Input
                                id="password_min_length"
                                type="number"
                                min="6"
                                max="50"
                                value={formData.password_min_length}
                                onChange={(e) =>
                                    handleInputChange(
                                        "password_min_length",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Mật khẩu phải có ít nhất{" "}
                                {formData.password_min_length} ký tự
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password_require_uppercase">
                                    Yêu cầu chữ hoa
                                </Label>
                                <Switch
                                    id="password_require_uppercase"
                                    checked={
                                        formData.password_require_uppercase
                                    }
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            "password_require_uppercase",
                                            checked
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="password_require_lowercase">
                                    Yêu cầu chữ thường
                                </Label>
                                <Switch
                                    id="password_require_lowercase"
                                    checked={
                                        formData.password_require_lowercase
                                    }
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            "password_require_lowercase",
                                            checked
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="password_require_numbers">
                                    Yêu cầu số
                                </Label>
                                <Switch
                                    id="password_require_numbers"
                                    checked={formData.password_require_numbers}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            "password_require_numbers",
                                            checked
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="password_require_symbols">
                                    Yêu cầu ký tự đặc biệt
                                </Label>
                                <Switch
                                    id="password_require_symbols"
                                    checked={formData.password_require_symbols}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            "password_require_symbols",
                                            checked
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Security */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                        Bảo mật phiên làm việc
                    </h3>

                    <div>
                        <Label htmlFor="session_timeout">
                            Thời gian hết hạn phiên (phút)
                        </Label>
                        <Input
                            id="session_timeout"
                            type="number"
                            min="5"
                            max="1440"
                            value={formData.session_timeout}
                            onChange={(e) =>
                                handleInputChange(
                                    "session_timeout",
                                    parseInt(e.target.value)
                                )
                            }
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Phiên làm việc sẽ hết hạn sau{" "}
                            {formData.session_timeout} phút không hoạt động
                        </p>
                    </div>
                </div>

                {/* Login Security */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bảo mật đăng nhập</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="max_login_attempts">
                                Số lần đăng nhập sai tối đa
                            </Label>
                            <Input
                                id="max_login_attempts"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.max_login_attempts}
                                onChange={(e) =>
                                    handleInputChange(
                                        "max_login_attempts",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Tài khoản sẽ bị khóa sau{" "}
                                {formData.max_login_attempts} lần đăng nhập sai
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="lockout_duration">
                                Thời gian khóa (phút)
                            </Label>
                            <Input
                                id="lockout_duration"
                                type="number"
                                min="1"
                                max="1440"
                                value={formData.lockout_duration}
                                onChange={(e) =>
                                    handleInputChange(
                                        "lockout_duration",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Tài khoản sẽ bị khóa trong{" "}
                                {formData.lockout_duration} phút
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-yellow-800">
                                Lưu ý
                            </h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                Thay đổi cài đặt bảo mật có thể ảnh hưởng đến
                                trải nghiệm người dùng. Hãy cân nhắc kỹ trước
                                khi thay đổi.
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
