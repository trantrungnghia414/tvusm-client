import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

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
                {children}
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
