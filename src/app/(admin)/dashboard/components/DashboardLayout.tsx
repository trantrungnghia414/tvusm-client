"use client";

import React, { ReactNode, useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";

interface DashboardLayoutProps {
    children: ReactNode;
    activeTab: string;
}

export default function DashboardLayout({
    children,
    activeTab,
}: DashboardLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={() => {}}
                mobileMenuOpen={mobileMenuOpen}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Header
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
