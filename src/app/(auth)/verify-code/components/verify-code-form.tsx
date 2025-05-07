"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

export function VerifyCodeForm() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    // Đếm ngược thời gian gửi lại mã
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetchApi(
                "/users/verify-code",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, code }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Xác thực thất bại");
            }

            toast.success("Xác thực thành công!");

            // Đảm bảo đợi toast hiển thị xong mới chuyển trang
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Xác thực thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email || countdown > 0) return;

        setResendLoading(true);

        try {
            const response = await fetchApi(
                "/users/resend-code",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gửi lại mã thất bại");
            }

            toast.success("Đã gửi lại mã xác thực mới!");
            setCountdown(60); // Đặt thời gian chờ 60 giây trước khi có thể gửi lại
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Gửi lại mã thất bại"
            );
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Xác thực tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <p className="text-sm text-gray-500">{email}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Mã xác thực</Label>
                            <Input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Nhập mã xác thực"
                                required
                            />
                            <p className="text-xs text-gray-500 italic">
                                Mã xác thực đã được gửi đến email của bạn và có
                                hiệu lực trong 15 phút
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full cursor-pointer"
                        >
                            {loading ? "Đang xác thực..." : "Xác thực"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleResendCode}
                            disabled={resendLoading || countdown > 0}
                            className="w-full cursor-pointer"
                        >
                            {resendLoading
                                ? "Đang gửi..."
                                : countdown > 0
                                ? `Gửi lại mã (${countdown}s)`
                                : "Gửi lại mã"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
