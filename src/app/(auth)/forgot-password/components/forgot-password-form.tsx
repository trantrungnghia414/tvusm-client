"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [emailError, setEmailError] = useState("");

    const emailLower = email.toLowerCase();

    // // Kiểm tra đầu vào
    const validateForm = () => {
        let isValid = true;
        const emailError = { email: "" };

        // Kiểm tra email
        if (!emailLower.endsWith("@gmail.com")) {
            emailError.email = "Email phải có đuôi @gmail.com";
            isValid = false;
        }

        // setErrors(newErrors);
        setEmailError(emailError.email);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra đầu vào trước khi gửi request
        if (!validateForm()) {
            return;
        }

        if (!email) {
            toast.error("Vui lòng nhập địa chỉ email");
            return;
        }

        setLoading(true);

        try {
            const response = await fetchApi("/users/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Có lỗi xảy ra");
            }

            toast.success("Mã đặt lại mật khẩu đã được gửi đến email của bạn");

            // Chuyển đến trang reset password với email
            setTimeout(() => {
                router.push(
                    `/reset-password?email=${encodeURIComponent(email)}`
                );
            }, 1500);
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi gửi yêu cầu"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quên mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError("");
                                }}
                                placeholder="Nhập địa chỉ email của bạn"
                                required
                            />
                            {emailError && (
                                <p className="text-sm text-red-500">
                                    {emailError}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">
                                Vui lòng nhập địa chỉ email đã đăng ký để nhận
                                mã đặt lại mật khẩu
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full cursor-pointer"
                        >
                            {loading
                                ? "Đang gửi..."
                                : "Gửi mã đặt lại mật khẩu"}
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        <a
                            href="/login"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Quay lại đăng nhập
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
