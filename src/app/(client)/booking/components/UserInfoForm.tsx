"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, FileText } from "lucide-react";
import { fetchApi } from "@/lib/api";
// import { toast } from "sonner";

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

    // Validate form on value change
    useEffect(() => {
        const isNameValid = validateName(value.name);
        const isEmailValid = validateEmail(value.email);
        const isPhoneValid = validatePhone(value.phone);

        onValidityChange(isNameValid && isEmailValid && isPhoneValid);
    }, [value, onValidityChange]);

    const validateName = (name: string): boolean => {
        if (!name.trim()) {
            setErrors((prev) => ({ ...prev, name: "Vui lòng nhập họ tên" }));
            return false;
        }
        setErrors((prev) => ({ ...prev, name: "" }));
        return true;
    };

    const validateEmail = (email: string): boolean => {
        if (!email.trim()) {
            setErrors((prev) => ({ ...prev, email: "Vui lòng nhập email" }));
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors((prev) => ({
                ...prev,
                email: "Vui lòng nhập email hợp lệ",
            }));
            return false;
        }
        setErrors((prev) => ({ ...prev, email: "" }));
        return true;
    };

    const validatePhone = (phone: string): boolean => {
        if (!phone.trim()) {
            setErrors((prev) => ({
                ...prev,
                phone: "Vui lòng nhập số điện thoại",
            }));
            return false;
        }
        if (!/^0\d{9}$/.test(phone)) {
            setErrors((prev) => ({
                ...prev,
                phone: "Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng số 0)",
            }));
            return false;
        }
        setErrors((prev) => ({ ...prev, phone: "" }));
        return true;
    };

    const handleChange = (field: keyof UserFormData, newValue: string) => {
        onChange({ ...value, [field]: newValue });
    };

    // Tự động điền thông tin người dùng khi component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    console.log("Đang lấy thông tin người dùng...");
                    const response = await fetchApi("/users/profile", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const user = await response.json();
                        console.log("Đã lấy được thông tin người dùng:", user);

                        // Cập nhật form với thông tin người dùng
                        onChange({
                            name: user.fullname || user.name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            notes: value.notes,
                        });

                        // Toast thông báo đã điền thông tin tự động
                        // toast.success("Đã tự động điền thông tin của bạn");
                    } else {
                        console.warn(
                            "Không thể lấy thông tin người dùng:",
                            response.status
                        );
                    }
                } else {
                    console.log(
                        "Người dùng chưa đăng nhập, không thể tự động điền thông tin"
                    );
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };

        fetchUserData();
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

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-blue-600" />
                            Số điện thoại{" "}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
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
