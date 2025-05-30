// src/lib/api.ts

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_URL = "http://localhost:3000";

export async function fetchApi(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return response;
}

export function getImageUrl(path: string | undefined | null): string | null {
    if (!path) return null;

    // Nếu là URL đầy đủ, trả về nguyên dạng
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    return `${API_URL}${path}?t=${timestamp}`;
}
