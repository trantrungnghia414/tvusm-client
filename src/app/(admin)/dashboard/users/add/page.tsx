"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import UserForm from "../components/UserForm";

export default function AddUserPage() {
    return (
        <DashboardLayout activeTab="users">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Thêm người dùng mới</h1>
                <UserForm />
            </div>
        </DashboardLayout>
    );
}
