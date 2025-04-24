"use client";

import { cn } from "lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: identifier,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Đăng nhập thất bại");
            }

            const token = await response.text();
            console.log("Login successful, token:", token);
            localStorage.setItem("token", token); // Lưu token vào localStorage

            const profileResponse = await fetch(
                "http://localhost:3000/users/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Gửi token trong header
                    },
                }
            );

            if (!profileResponse.ok) {
                throw new Error("Lấy thông tin người dùng thất bại");
            }

            const userProfile = await profileResponse.json();
            // console.log("User profile:", userProfile);

            if (userProfile.role === "admin") {
                window.location.href = "/dashboard"; // Chuyển hướng đến trang admin nếu là admin
            }
            if (userProfile.role === "customer") {
                window.location.href = "/"; // Chuyển hướng đến trang user nếu là user
            }
            if (userProfile.role === "manager") {
                window.location.href = "/"; // Chuyển hướng đến trang user nếu là user
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="identifier">Username</Label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) =>
                                        setIdentifier(e.target.value)
                                    }
                                    placeholder="username or email"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="password"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>
                                <Button variant="outline" className="w-full">
                                    Login with Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <a
                                href="register"
                                className="underline underline-offset-4"
                            >
                                Sign up
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
