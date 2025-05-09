import React, { ReactNode } from "react";

interface SidebarItemProps {
    icon: ReactNode;
    title: string;
    active?: boolean;
    onClick: () => void;
    count?: number | null;
}

export default function SidebarItem({
    icon,
    title,
    active = false,
    onClick,
    count = null,
}: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start transition-colors ${
                active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
            <span className="shrink-0">{icon}</span>
            <span className="flex-1 truncate">{title}</span>
            {count !== null && (
                <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs ${
                        active
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                    }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
}
