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

/**
 * Format khoảng thời gian sự kiện thành chuỗi ngày tháng
 * @param start Ngày bắt đầu (string date)
 * @param end Ngày kết thúc (string date)
 * @returns Chuỗi ngày tháng đã được định dạng theo tiếng Việt
 */
export const formatSEDate = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const isSameDay =
        startDate.getDate() === endDate.getDate() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear();

    const startStr = startDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    if (isSameDay) {
        return startStr;
    } else {
        const endStr = endDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        return `${startStr} - ${endStr}`;
    }
};

/**
 * Format thời gian sự kiện
 * @param date Chuỗi ngày giờ
 * @returns Chuỗi giờ phút đã được định dạng theo tiếng Việt
 */
export const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Format đầy đủ ngày giờ
 * @param date Chuỗi ngày giờ
 * @returns Chuỗi ngày giờ đã được định dạng đầy đủ theo tiếng Việt
 */
export const formatFullDateTime = (date: string) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })} ${dateObj.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;
};