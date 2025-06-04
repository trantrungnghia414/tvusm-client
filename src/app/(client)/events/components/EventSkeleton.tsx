import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-5">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />

                <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                <Skeleton className="h-9 w-full" />
            </div>
        </div>
    );
}
