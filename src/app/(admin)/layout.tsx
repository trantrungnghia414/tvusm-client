import React from "react";
import "../globals.css";
import { Inter } from "next/font/google";

const geistInter = Inter({
    variable: "--font-geist-inter",
    subsets: ["latin"],
});

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${geistInter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
