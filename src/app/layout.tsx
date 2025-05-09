import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/app/providers";
import GoogleAuthHandler from "@/components/auth/GoogleAuthHandler";

const geistInter = Inter({
    variable: "--font-geist-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Nhà Thi Đấu TVU",
    description: "Nhà Thi Đấu TVU - Nơi dành cho những người yêu thể thao",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistInter.variable} antialiased`}>
                <Providers>
                    <GoogleAuthHandler /> {/* Thêm component ở đây */}
                    {children}
                    <Toaster position="top-right" />
                </Providers>
            </body>
        </html>
    );
}
