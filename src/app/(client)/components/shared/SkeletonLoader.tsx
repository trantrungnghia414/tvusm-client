import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "../layout/Navbar";

export default function SkeletonLoader() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <main>
                {/* Hero Skeleton */}
                <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 pt-32 pb-20 md:pb-32">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="lg:w-1/2 mb-12 lg:mb-0">
                                <Skeleton className="h-8 w-48 bg-blue-600/30 mb-6" />
                                <Skeleton className="h-12 w-full bg-blue-600/30 mb-3" />
                                <Skeleton className="h-12 w-5/6 bg-blue-600/30 mb-6" />
                                <Skeleton className="h-6 w-full bg-blue-600/30 mb-2" />
                                <Skeleton className="h-6 w-5/6 bg-blue-600/30 mb-8" />
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Skeleton className="h-12 w-40 bg-blue-600/30" />
                                    <Skeleton className="h-12 w-40 bg-blue-600/30" />
                                </div>
                            </div>
                            <div className="lg:w-1/2">
                                <Skeleton className="h-64 w-full rounded-lg bg-blue-600/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Venues Skeleton */}
                <div className="container mx-auto px-4 py-16">
                    <div className="mb-10">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-xl overflow-hidden"
                            >
                                <Skeleton className="h-48 w-full" />
                                <div className="p-5 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Courts Skeleton */}
                <div className="bg-gray-50 py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-10">
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-6 w-96" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl overflow-hidden"
                                >
                                    <Skeleton className="h-48 w-full" />
                                    <div className="p-5 space-y-3">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Statistics Skeleton */}
                <div className="py-16 container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="p-6 rounded-xl">
                                <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
