import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Nhà Thi Đấu TVU",
    description:
        "Nhà Thi Đấu TVU - Nơi tổ chức các sự kiện thể thao của Trường Đại Học Trà Vinh",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
            >
                <Header />
                <Nav />
                <div>
                    <main className="flex-1 min-h-screen mt-[113px]">
                        {children}
                    </main>
                </div>
                <Footer />
            </body>
        </html>
    );
}
