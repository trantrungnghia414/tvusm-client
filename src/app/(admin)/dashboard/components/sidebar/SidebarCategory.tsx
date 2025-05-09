import React from "react";

interface SidebarCategoryProps {
    label: string;
}

export default function SidebarCategory({ label }: SidebarCategoryProps) {
    return (
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 mt-4 first:mt-0">
            {label}
        </div>
    );
}
