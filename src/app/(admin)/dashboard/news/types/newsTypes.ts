export interface News {
    news_id: number;
    title: string;
    slug: string;
    content: string;
    category_id: number;
    author_id: number;
    summary?: string;
    thumbnail?: string;
    status: 'draft' | 'published' | 'archived';
    view_count: number;
    is_featured: number;
    is_internal: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
    
    // Các trường bổ sung từ relation
    category_name?: string;
    author_name?: string;
}

export interface NewsCategory {
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    is_active: number;
    created_at: string;
}

export interface NewsStats {
    totalNews: number;
    publishedNews: number;
    draftNews: number;
    archivedNews: number;
    featuredNews: number;
    mostViewedNews?: {
        title: string;
        views: number;
    };
}