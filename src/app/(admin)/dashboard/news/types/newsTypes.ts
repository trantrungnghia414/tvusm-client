// Kiểu dữ liệu cho tin tức
export interface News {
    news_id: number;
    title: string;
    slug: string;
    content: string;
    summary?: string;
    thumbnail?: string;
    category_id: number;
    category_name?: string;
    author_id: number;
    author_name?: string;
    status: "draft" | "published" | "archived";
    view_count: number;
    is_featured: boolean;
    is_internal: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

// Kiểu dữ liệu cho danh mục tin tức
export interface NewsCategory {
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

// Kiểu dữ liệu cho form thêm/sửa tin tức
export interface NewsFormData {
    title: string;
    slug?: string;
    content: string;
    summary?: string;
    category_id: number;
    status: "draft" | "published" | "archived";
    is_featured?: boolean;
    is_internal?: boolean;
    published_at?: string | null;
    thumbnail?: File | null;
}

// Thống kê tin tức
export interface NewsStatsType {
    totalNews: number;
    publishedNews: number;
    draftNews: number;
    featuredNews: number;
}

// Response từ API
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
