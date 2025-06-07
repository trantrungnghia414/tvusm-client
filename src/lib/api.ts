// src/lib/api.ts

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_URL = "http://localhost:3000";

export async function fetchApi(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return response;
}

export function getImageUrl(path: string | null | undefined): string {
    if (!path) return "/images/placeholder.jpg"; // Ảnh mặc định nếu không có path

    // Xử lý URL đầy đủ
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // Xử lý đường dẫn tương đối tới uploads
    if (path.startsWith("/uploads")) {
        return `${API_URL}${path}`;
    }

    return path;
}
