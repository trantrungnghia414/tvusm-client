import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface UserFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    roleFilter: string;
    setRoleFilter: (role: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}

export default function UserFilters({
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
}: UserFiltersProps) {
    return (
        // <div className="grid gap-4 md:grid-cols-3 bg-white p-4 rounded-lg border">
        <div className="flex justify-between bg-white p-4 rounded-lg border">
            <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Tìm theo tên, email, username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <Label htmlFor="role-filter">Vai trò</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger id="role-filter">
                            <SelectValue placeholder="Tất cả vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả vai trò</SelectItem>
                            <SelectItem value="admin">Quản trị viên</SelectItem>
                            <SelectItem value="manager">Quản lý</SelectItem>
                            <SelectItem value="customer">Khách hàng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter">Trạng thái</Label>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger id="status-filter">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="active">
                                Đang hoạt động
                            </SelectItem>
                            <SelectItem value="inactive">
                                Bị khóa/Chưa xác thực
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
