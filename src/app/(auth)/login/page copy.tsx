"use client";

import React from "react";
import { useState } from "react";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

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
            setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-80"
            >
                <div className="mb-4">
                    <label
                        htmlFor="identifier" // htmlFor để liên kết label với input
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tên đăng nhập
                    </label>
                    <input
                        type="text"
                        id="identifier" // id để liên kết label với input
                        value={identifier} // giá trị của input sẽ được lấy từ state identifier
                        onChange={(e) => setIdentifier(e.target.value)} // khi người dùng nhập vào input, state identifier sẽ được cập nhật
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        placeholder="Username or email"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Mật khẩu
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password} // giá trị của input sẽ được lấy từ state password
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        placeholder="Enter password"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
