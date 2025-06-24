// client/src/app/(admin)/dashboard/settings/components/GeneralSettingsSection.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Upload, X } from "lucide-react";
import { GeneralSettings } from "../types/settingsTypes";
import { toast } from "sonner";

interface GeneralSettingsSectionProps {
    settings: GeneralSettings;
    onSave: (settings: GeneralSettings) => Promise<void>;
    loading?: boolean;
}

export default function GeneralSettingsSection({
    settings,
    onSave,
    loading = false,
}: GeneralSettingsSectionProps) {
    const [formData, setFormData] = useState<GeneralSettings>(settings);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.site_logo || null
    );
    const [saving, setSaving] = useState(false);

    const handleInputChange = (field: keyof GeneralSettings, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước logo không được vượt quá 5MB");
                return;
            }

            setLogoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setFormData(prev => ({
            ...prev,
            site_logo: undefined,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Nếu có logo mới, upload trước
            let logoUrl = formData.site_logo;
            if (logoFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('logo', logoFile);
                
                const uploadResponse = await fetch('/api/settings/upload-logo', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (uploadResponse.ok) {
                    const { url } = await uploadResponse.json();
                    logoUrl = url;
                }
            }

            await onSave({
                ...formData,
                site_logo: logoUrl,
            });

            toast.success("Đã lưu cài đặt chung");
        } catch (error) {
            toast.error("Không thể lưu cài đặt");
            console.error("Error saving general settings:", error);
        } finally {
            setSaving(false);
        }
    };

    const timezones = [
        { value: "Asia/Ho_Chi_Minh", label: "GMT+7 (Việt Nam)" },
        { value: "Asia/Bangkok", label: "GMT+7 (Thailand)" },
        { value: "Asia/Singapore", label: "GMT+8 (Singapore)" },
    ];

    const dateFormats = [
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
    ];

    const timeFormats = [
        { value: "HH:mm", label: "24 giờ (HH:mm)" },
        { value: "hh:mm A", label: "12 giờ (hh:mm AM/PM)" },
    ];

    const languages = [
        { value: "vi", label: "Tiếng Việt" },
        { value: "en", label: "English" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Site Info */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="site_name">Tên website</Label>
                        <Input
                            id="site_name"
                            value={formData.site_name}
                            onChange={(e) => handleInputChange("site_name", e.target.value)}
                            placeholder="TVU Sports Hub"
                        />
                    </div>

                    <div>
                        <Label htmlFor="site_description">Mô tả website</Label>
                        <Textarea
                            id="site_description"
                            value={formData.site_description}
                            onChange={(e) => handleInputChange("site_description", e.target.value)}
                            placeholder="Hệ thống quản lý sân thể thao Trường Đại học Trà Vinh"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Logo website</Label>
                        <div className="space-y-3">
                            {logoPreview && (
                                <div className="relative inline-block">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-32 h-32 object-contain border rounded-lg"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                        onClick={clearLogo}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                            <div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <Label
                                    htmlFor="logo-upload"
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                    <Upload className="w-4 h-4" />
                                    Chọn logo
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">
                                    Định dạng: JPG, PNG. Tối đa 5MB.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Localization */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bản địa hóa</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Múi giờ</Label>
                            <Select
                                value={formData.timezone}
                                onValueChange={(value) => handleInputChange("timezone", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {timezones.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                            {tz.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Ngôn ngữ</Label>
                            <Select
                                value={formData.language}
                                onValueChange={(value) => handleInputChange("language", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Định dạng ngày</Label>
                            <Select
                                value={formData.date_format}
                                onValueChange={(value) => handleInputChange("date_format", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {dateFormats.map((format) => (
                                        <SelectItem key={format.value} value={format.value}>
                                            {format.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Định dạng giờ</Label>
                            <Select
                                value={formData.time_format}
                                onValueChange={(value) => handleInputChange("time_format", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeFormats.map((format) => (
                                        <SelectItem key={format.value} value={format.value}>
                                            {format.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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