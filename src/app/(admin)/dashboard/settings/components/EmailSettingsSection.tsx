// client/src/app/(admin)/dashboard/settings/components/EmailSettingsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Send, Eye, EyeOff } from "lucide-react";
import { EmailSettings } from "../types/settingsTypes";
import { toast } from "sonner";

interface EmailSettingsSectionProps {
    settings: EmailSettings;
    onSave: (settings: EmailSettings) => Promise<void>;
    loading?: boolean;
}

export default function EmailSettingsSection({
    settings,
    onSave,
    loading = false,
}: EmailSettingsSectionProps) {
    const [formData, setFormData] = useState<EmailSettings>(settings);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (field: keyof EmailSettings, value: EmailSettings[keyof EmailSettings]) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await onSave(formData);
            toast.success("Đã lưu cài đặt email");
        } catch (error) {
            toast.error("Không thể lưu cài đặt");
            console.error("Error saving email settings:", error);
        } finally {
            setSaving(false);
        }
    };

    const testEmailConnection = async () => {
        try {
            setTesting(true);

            const response = await fetch("/api/settings/test-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Kết nối email thành công!");
            } else {
                const error = await response.json();
                toast.error(`Lỗi kết nối: ${error.message}`);
            }
        } catch (error) {
            toast.error("Không thể kiểm tra kết nối email");
            console.error("Error testing email:", error);
        } finally {
            setTesting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cài đặt Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="email_notifications">
                                Bật thông báo email
                            </Label>
                            <p className="text-sm text-gray-500">
                                Gửi email thông báo cho người dùng về các hoạt
                                động
                            </p>
                        </div>
                        <Switch
                            id="email_notifications"
                            checked={formData.email_notifications}
                            onCheckedChange={(checked) =>
                                handleInputChange(
                                    "email_notifications",
                                    checked
                                )
                            }
                        />
                    </div>
                </div>

                {formData.email_notifications && (
                    <>
                        {/* SMTP Configuration */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Cấu hình SMTP
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="smtp_host">SMTP Host</Label>
                                    <Input
                                        id="smtp_host"
                                        value={formData.smtp_host}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "smtp_host",
                                                e.target.value
                                            )
                                        }
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="smtp_port">SMTP Port</Label>
                                    <Input
                                        id="smtp_port"
                                        type="number"
                                        value={formData.smtp_port}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "smtp_port",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        placeholder="587"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="smtp_user">
                                        SMTP Username
                                    </Label>
                                    <Input
                                        id="smtp_user"
                                        value={formData.smtp_user}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "smtp_user",
                                                e.target.value
                                            )
                                        }
                                        placeholder="your-email@gmail.com"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="smtp_password">
                                        SMTP Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="smtp_password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={formData.smtp_password}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "smtp_password",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Mật khẩu ứng dụng"
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="smtp_secure"
                                    checked={formData.smtp_secure}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            "smtp_secure",
                                            checked
                                        )
                                    }
                                />
                                <Label htmlFor="smtp_secure">
                                    Sử dụng SSL/TLS
                                </Label>
                            </div>
                        </div>

                        {/* Sender Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Thông tin người gửi
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="from_email">
                                        Email người gửi
                                    </Label>
                                    <Input
                                        id="from_email"
                                        type="email"
                                        value={formData.from_email}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "from_email",
                                                e.target.value
                                            )
                                        }
                                        placeholder="noreply@tvusports.com"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="from_name">
                                        Tên người gửi
                                    </Label>
                                    <Input
                                        id="from_name"
                                        value={formData.from_name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "from_name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="TVU Sports Hub"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Test Email */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Kiểm tra kết nối
                            </h3>
                            <Button
                                onClick={testEmailConnection}
                                disabled={testing}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {testing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Gửi email test
                            </Button>
                        </div>
                    </>
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
                            <Save className="w-4 h-4" />
                        )}
                        Lưu thay đổi
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
