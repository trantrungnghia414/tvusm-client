import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
    title: "TVU Sports Hub - Hệ thống quản lý nhà thi đấu Đại học Trà Vinh",
    description:
        "Hệ thống đặt sân và quản lý nhà thi đấu tại Trường Đại học Trà Vinh",
};

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
            <Toaster position="top-center" richColors closeButton />
        </>
    );
}
