import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Định dạng số thành chuỗi tiền tệ VND
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi đã định dạng (vd: 123,456 ₫)
 */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Định dạng ngày tháng theo định dạng Việt Nam (VD: 05/06/2025)
 * @param dateString Chuỗi ngày tháng hợp lệ (ISO, UTC, v.v.)
 * @returns Ngày tháng đã được định dạng (dd/MM/yyyy)
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

/**
 * Định dạng ngày tháng với tuỳ chọn hiển thị thêm giờ
 * @param dateString Chuỗi ngày tháng hợp lệ
 * @param includeTime Có hiển thị giờ hay không
 * @returns Ngày tháng (và giờ) đã được định dạng
 */
export function formatDateTime(
    dateString: string,
    includeTime: boolean = false
): string {
    const date = new Date(dateString);

    if (includeTime) {
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return formatDate(dateString);
}

/**
 * Định dạng ngày tháng theo kiểu thân thiện (VD: "Hôm nay", "Hôm qua", "2 ngày trước")
 * @param dateString Chuỗi ngày tháng hợp lệ
 * @returns Ngày tháng kiểu thân thiện
 */
export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
        return "Hôm nay";
    } else if (diffInDays === 1) {
        return "Hôm qua";
    } else if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} tuần trước`;
    } else {
        return formatDate(dateString);
    }
}
