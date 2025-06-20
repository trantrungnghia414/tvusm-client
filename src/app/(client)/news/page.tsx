// client/src/app/(client)/news/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/app/(client)/components/layout/FixedNavbar";
import Footer from "@/app/(client)/components/layout/Footer";
import NewsHero from "./components/NewsHero";
import NewsSearch from "./components/NewsSearch";
import NewsFilter from "./components/NewsFilter";
import NewsGrid from "./components/NewsGrid";
import NewsPagination from "./components/NewsPagination";
import { NewsArticle, NewsCategory, NewsFilters } from "./types/newsTypes";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // States
    const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 12;

    // Filters
    const [filters, setFilters] = useState<NewsFilters>({
        category: searchParams.get("category") || "all",
        search: searchParams.get("search") || "",
        featured: searchParams.get("featured") === "true",
    });

    // Fetch featured news
    const fetchFeaturedNews = useCallback(async () => {
        try {
            const response = await fetchApi("/news/featured?limit=3");
            if (response.ok) {
                const data = await response.json();
                setFeaturedNews(data);
            }
        } catch (error) {
            console.error("Error fetching featured news:", error);
        }
    }, []);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetchApi("/news/categories");
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    // Fetch news with filters
    const fetchNews = useCallback(
        async (page: number = 1, loadingState: boolean = true) => {
            try {
                if (loadingState) {
                    setSearchLoading(true);
                }

                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: itemsPerPage.toString(),
                });

                if (filters.search) {
                    params.append("search", filters.search);
                }

                if (filters.category !== "all") {
                    params.append("category", filters.category);
                }

                if (filters.featured) {
                    params.append("featured", "true");
                }

                const response = await fetchApi(`/news/public?${params}`);

                if (response.ok) {
                    const data = await response.json();

                    // Assuming API returns { news: [], pagination: { page, totalPages, totalItems } }
                    if (Array.isArray(data)) {
                        setNews(data);
                        setTotalItems(data.length);
                        setTotalPages(Math.ceil(data.length / itemsPerPage));
                    } else {
                        setNews(data.news || data);
                        setTotalItems(
                            data.pagination?.totalItems || data.length || 0
                        );
                        setTotalPages(data.pagination?.totalPages || 1);
                    }
                } else {
                    throw new Error("Failed to fetch news");
                }
            } catch (error) {
                console.error("Error fetching news:", error);
                toast.error("Không thể tải tin tức");
                setNews([]);
            } finally {
                if (loadingState) {
                    setSearchLoading(false);
                }
            }
        },
        [filters, itemsPerPage]
    );

    // Initial data fetch
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            await Promise.all([
                fetchFeaturedNews(),
                fetchCategories(),
                fetchNews(1, false),
            ]);
            setLoading(false);
        };

        initializeData();
    }, [fetchFeaturedNews, fetchCategories, fetchNews]);

    // Update URL when filters change
    const updateURL = useCallback(
        (newFilters: NewsFilters, page: number = 1) => {
            const params = new URLSearchParams();

            if (newFilters.search) params.set("search", newFilters.search);
            if (newFilters.category !== "all")
                params.set("category", newFilters.category);
            if (newFilters.featured) params.set("featured", "true");
            if (page > 1) params.set("page", page.toString());

            const queryString = params.toString();
            const newURL = queryString ? `/news?${queryString}` : "/news";

            router.push(newURL, { scroll: false });
        },
        [router]
    );

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchNews(1);
        updateURL(filters, 1);
    };

    // Handle filter changes
    const handleCategoryChange = (categoryId: string) => {
        const newFilters = { ...filters, category: categoryId };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchNews(1);
        updateURL(newFilters, 1);
    };

    const handleFeaturedChange = (featured: boolean) => {
        const newFilters = { ...filters, featured };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchNews(1);
        updateURL(newFilters, 1);
    };

    const handleSearchChange = (search: string) => {
        setFilters({ ...filters, search });
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchNews(page);
        updateURL(filters, page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Clear filters
    const handleClearFilters = () => {
        const newFilters: NewsFilters = {
            category: "all",
            search: "",
            featured: false,
        };
        setFilters(newFilters);
        setCurrentPage(1);
        fetchNews(1);
        router.push("/news");
    };

    // Count active filters
    const activeFiltersCount = [
        filters.category !== "all",
        filters.search !== "",
        filters.featured,
    ].filter(Boolean).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center py-20 mt-16">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">
                            Đang tải trang tin tức...
                        </p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-16">
                {/* Hero Section */}
                <NewsHero featuredNews={featuredNews} />

                {/* Main Content */}
                <section id="latest-news" className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar */}
                            <aside className="lg:col-span-1">
                                <div className="sticky top-24 space-y-6">
                                    {/* Search */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                        <h3 className="font-semibold text-gray-900 mb-4">
                                            Tìm kiếm tin tức
                                        </h3>
                                        <NewsSearch
                                            value={filters.search}
                                            onChange={handleSearchChange}
                                            onSearch={handleSearch}
                                        />
                                    </div>

                                    {/* Filters */}
                                    <NewsFilter
                                        categories={categories}
                                        selectedCategory={filters.category}
                                        onCategoryChange={handleCategoryChange}
                                        showFeatured={filters.featured}
                                        onFeaturedChange={handleFeaturedChange}
                                        activeFiltersCount={activeFiltersCount}
                                        onClearFilters={handleClearFilters}
                                    />
                                </div>
                            </aside>

                            {/* Main Content */}
                            <main className="lg:col-span-3">
                                <div className="space-y-8">
                                    {/* Results Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {filters.search
                                                    ? `Kết quả tìm kiếm: "${filters.search}"`
                                                    : filters.category !== "all"
                                                    ? categories.find(
                                                          (c) =>
                                                              c.category_id.toString() ===
                                                              filters.category
                                                      )?.name || "Tin tức"
                                                    : filters.featured
                                                    ? "Tin tức nổi bật"
                                                    : "Tin tức mới nhất"}
                                            </h2>
                                            {totalItems > 0 && (
                                                <p className="text-gray-600 mt-1">
                                                    Tìm thấy {totalItems} tin
                                                    tức
                                                </p>
                                            )}
                                        </div>

                                        {/* Quick actions */}
                                        {activeFiltersCount > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">
                                                    {activeFiltersCount} bộ lọc
                                                    đang áp dụng
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* News Grid */}
                                    <NewsGrid
                                        articles={news}
                                        loading={searchLoading}
                                        columns={3}
                                    />

                                    {/* Pagination */}
                                    <NewsPagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        totalItems={totalItems}
                                        itemsPerPage={itemsPerPage}
                                    />
                                </div>
                            </main>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
