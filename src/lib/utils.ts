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
