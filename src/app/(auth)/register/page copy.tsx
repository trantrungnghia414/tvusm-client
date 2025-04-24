"use client";

import React from "react";
import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:3000/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Đăng ký thất bại");
            }

            const data = await response.json();
            console.log("Registration successful:", data);
            window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        } catch (error) {
            console.error("Registration error:", error);
            setError("Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Register</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-80"
            >
                <div className="mb-4">
                    <label
                        htmlFor="username" // htmlFor để liên kết label với input
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tên đăng nhập
                    </label>
                    <input
                        type="text"
                        id="username" // id để liên kết label với input
                        value={username} // giá trị của input sẽ được lấy từ state identifier
                        onChange={(e) => setUsername(e.target.value)} // khi người dùng nhập vào input, state identifier sẽ được cập nhật
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        placeholder="Enter username"
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="email" // htmlFor để liên kết label với input
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email" // id để liên kết label với input
                        value={email} // giá trị của input sẽ được lấy từ state identifier
                        onChange={(e) => setEmail(e.target.value)} // khi người dùng nhập vào input, state identifier sẽ được cập nhật
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                        placeholder="Enter email"
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
