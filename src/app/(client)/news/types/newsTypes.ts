// client/src/app/(client)/news/types/newsTypes.ts
export interface NewsArticle {
    news_id: number;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    thumbnail?: string;
    category_id: number;
    category_name?: string;
    author_id: number;
    author_name?: string;
    author_username?: string;
    author_avatar?: string;
    status: "published" | "draft" | "archived";
    is_featured: number;
    is_internal: number;
    view_count: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface NewsCategory {
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: number;
}

export interface NewsFilters {
    category: string;
    search: string;
    featured: boolean;
}

export interface NewsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
