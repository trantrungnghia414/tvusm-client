"use client";

import React from "react";
import CategoryForm from "./components/CategoryForm";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function NewsCategoriesPage() {
    return (
        <DashboardLayout activeTab="news">
            <CategoryForm />
        </DashboardLayout>
    );
}
