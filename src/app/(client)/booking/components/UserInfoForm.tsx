"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, FileText } from "lucide-react";

export interface UserFormData {
    name: string;
    email: string;
    phone: string;
    notes: string;
}

interface UserInfoFormProps {
    value: UserFormData;
    onChange: (data: UserFormData) => void;
    onValidityChange: (isValid: boolean) => void;
}

export default function UserInfoForm({
    value,
    onChange,
    onValidityChange,
}: UserInfoFormProps) {
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Handle input change
    const handleChange = (field: keyof UserFormData, val: string) => {
        onChange({
            ...value,
            [field]: val,
        });
    };

    // Validate form
    useEffect(() => {
        const newErrors = {
            name: "",
            email: "",
            phone: "",
        };

        // Validate name
        if (!value.name.trim()) {
            newErrors.name = "Vui lòng nhập họ tên";
        }

        // Validate email
        if (!value.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
            newErrors.email = "Email không hợp lệ";
        }

        // Validate phone
        if (!value.phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10}$/.test(value.phone.replace(/\s+/g, ""))) {
            newErrors.phone = "Số điện thoại phải có 10 chữ số";
        }

        setErrors(newErrors);

        // Check if form is valid
        const isValid = !newErrors.name && !newErrors.email && !newErrors.phone;
        onValidityChange(isValid);
    }, [value, onValidityChange]);

    // Get the current user data from localStorage if available
    useEffect(() => {
        try {
            const userData = localStorage.getItem("userData");
            if (userData) {
                const user = JSON.parse(userData);

                // Only prefill if the form is empty
                if (!value.name && !value.email && !value.phone) {
                    onChange({
                        name: user.fullname || user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        notes: value.notes,
                    });
                }
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    }, []);

    return (
        <Card className="border-blue-100">
            <CardHeader className="pb-3">
                <CardTitle>Thông Tin Liên Hệ</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            Họ tên <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Nhập họ tên người đặt sân"
                            value={value.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-blue-600" />
                            Email <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={value.email}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-blue-600" />
                            Số điện thoại{" "}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="phone"
                            placeholder="0xxxxxxxxx"
                            value={value.phone}
                            onChange={(e) =>
                                handleChange("phone", e.target.value)
                            }
                            className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Ghi chú
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Thêm yêu cầu đặc biệt hoặc ghi chú (nếu có)"
                            value={value.notes}
                            onChange={(e) =>
                                handleChange("notes", e.target.value)
                            }
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
