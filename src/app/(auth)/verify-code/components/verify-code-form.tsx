"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function VerifyCodeForm() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/users/verify-code",
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
                router.push("/login"); // Sử dụng replace thay vì push
            }, 1500);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Xác thực thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) return;

        try {
            const response = await fetch(
                "http://localhost:3000/users/resend-code",
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
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Gửi lại mã thất bại"
            );
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
                            disabled={loading}
                            className="w-full cursor-pointer"
                        >
                            Gửi lại mã
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
