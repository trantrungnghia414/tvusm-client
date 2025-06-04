import React from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoEvents() {
    return (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
                Không tìm thấy sự kiện nào
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Không có sự kiện nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy
                thử điều chỉnh bộ lọc hoặc quay lại sau.
            </p>
            <Link href="/events">
                <Button variant="outline">Xem tất cả sự kiện</Button>
            </Link>
        </div>
    );
}
