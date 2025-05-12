import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, X } from "lucide-react";
import { ArenaFilters as ArenaFilterType } from "../types/arenaTypes";

interface ArenaFiltersProps {
    filters: ArenaFilterType;
    setFilters: React.Dispatch<React.SetStateAction<ArenaFilterType>>;
}

export default function ArenaFilters({
    filters,
    setFilters,
}: ArenaFiltersProps) {
    const [localFilters, setLocalFilters] = React.useState<ArenaFilterType>({
        ...filters,
        priceRangeFilter: filters.priceRangeFilter || "all",
    });

    const clearAllFilters = () => {
        setFilters({
            search: "",
            type: [],
            status: [],
            priceRangeFilter: "all",
        });
    };

    const removePriceFilter = () => {
        setFilters({
            ...filters,
            priceRangeFilter: "all",
        });
    };

    const removeTypeFilter = (typeToRemove: string) => {
        setFilters({
            ...filters,
            type: filters.type.filter((type) => type !== typeToRemove),
        });
    };

    const removeStatusFilter = (statusToRemove: string) => {
        setFilters({
            ...filters,
            status: filters.status.filter(
                (status) => status !== statusToRemove
            ),
        });
    };

    const getTypeName = (type: string) => {
        const typeMap: Record<string, string> = {
            football: "Sân bóng đá",
            volleyball: "Sân bóng chuyền",
            basketball: "Sân bóng rổ",
            badminton: "Sân cầu lông",
            tennis: "Sân tennis",
            swimming: "Hồ bơi",
            other: "Khác",
        };
        return typeMap[type] || type;
    };

    const getStatusName = (status: string) => {
        const statusMap: Record<string, string> = {
            active: "Hoạt động",
            maintenance: "Đang bảo trì",
            inactive: "Không hoạt động",
        };
        return statusMap[status] || status;
    };

    const getPriceRangeName = (priceRange: string) => {
        const priceRangeMap: Record<string, string> = {
            all: "Tất cả giá",
            "0-200000": "Dưới 200.000đ",
            "200000-400000": "200.000đ - 400.000đ",
            "400000-600000": "400.000đ - 600.000đ",
            "600000-800000": "600.000đ - 800.000đ",
            "800000-1000000": "800.000đ - 1.000.000đ",
            "1000000+": "Trên 1.000.000đ",
        };
        return priceRangeMap[priceRange] || priceRange;
    };

    const applyFilters = () => {
        setFilters(localFilters);
    };

    const resetLocalFilters = () => {
        setLocalFilters(filters);
    };

    const hasActiveFilters =
        filters.search !== "" ||
        filters.type.length > 0 ||
        filters.status.length > 0 ||
        filters.priceRangeFilter !== "all";

    return (
        <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm sân thể thao..."
                        className="pl-9"
                        value={filters.search}
                        onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                        }
                    />
                </div>

                <div className="flex sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Filter className="h-4 w-4 mr-2" />
                                Bộ lọc
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh]">
                            <SheetHeader className="mb-4">
                                <SheetTitle>Lọc sân thể thao</SheetTitle>
                            </SheetHeader>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile-type">
                                        Loại sân
                                    </Label>
                                    <Select
                                        onValueChange={(value) => {
                                            if (
                                                !localFilters.type.includes(
                                                    value
                                                )
                                            ) {
                                                setLocalFilters({
                                                    ...localFilters,
                                                    type: [
                                                        ...localFilters.type,
                                                        value,
                                                    ],
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="mobile-type">
                                            <SelectValue placeholder="Chọn loại sân" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="football">
                                                Sân bóng đá
                                            </SelectItem>
                                            <SelectItem value="volleyball">
                                                Sân bóng chuyền
                                            </SelectItem>
                                            <SelectItem value="basketball">
                                                Sân bóng rổ
                                            </SelectItem>
                                            <SelectItem value="badminton">
                                                Sân cầu lông
                                            </SelectItem>
                                            <SelectItem value="tennis">
                                                Sân tennis
                                            </SelectItem>
                                            <SelectItem value="swimming">
                                                Hồ bơi
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Khác
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {localFilters.type.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {localFilters.type.map((type) => (
                                                <Badge
                                                    key={type}
                                                    variant="outline"
                                                >
                                                    {getTypeName(type)}
                                                    <button
                                                        className="ml-1 text-gray-500 hover:text-gray-700"
                                                        onClick={() =>
                                                            setLocalFilters({
                                                                ...localFilters,
                                                                type: localFilters.type.filter(
                                                                    (t) =>
                                                                        t !==
                                                                        type
                                                                ),
                                                            })
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile-status">
                                        Trạng thái
                                    </Label>
                                    <Select
                                        onValueChange={(value) => {
                                            if (
                                                !localFilters.status.includes(
                                                    value
                                                )
                                            ) {
                                                setLocalFilters({
                                                    ...localFilters,
                                                    status: [
                                                        ...localFilters.status,
                                                        value,
                                                    ],
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="mobile-status">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Hoạt động
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Đang bảo trì
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Không hoạt động
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {localFilters.status.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {localFilters.status.map(
                                                (status) => (
                                                    <Badge
                                                        key={status}
                                                        variant="outline"
                                                    >
                                                        {getStatusName(status)}
                                                        <button
                                                            className="ml-1 text-gray-500 hover:text-gray-700"
                                                            onClick={() =>
                                                                setLocalFilters(
                                                                    {
                                                                        ...localFilters,
                                                                        status: localFilters.status.filter(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s !==
                                                                                status
                                                                        ),
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile-price-range">
                                        Khoảng giá
                                    </Label>
                                    <Select
                                        value={localFilters.priceRangeFilter}
                                        onValueChange={(value) => {
                                            setLocalFilters({
                                                ...localFilters,
                                                priceRangeFilter: value,
                                            });
                                        }}
                                    >
                                        <SelectTrigger id="mobile-price-range">
                                            <SelectValue placeholder="Chọn khoảng giá" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Tất cả giá
                                            </SelectItem>
                                            <SelectItem value="0-200000">
                                                Dưới 200.000đ
                                            </SelectItem>
                                            <SelectItem value="200000-400000">
                                                200.000đ - 400.000đ
                                            </SelectItem>
                                            <SelectItem value="400000-600000">
                                                400.000đ - 600.000đ
                                            </SelectItem>
                                            <SelectItem value="600000-800000">
                                                600.000đ - 800.000đ
                                            </SelectItem>
                                            <SelectItem value="800000-1000000">
                                                800.000đ - 1.000.000đ
                                            </SelectItem>
                                            <SelectItem value="1000000+">
                                                Trên 1.000.000đ
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <SheetFooter className="mt-6">
                                <div className="flex w-full gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={resetLocalFilters}
                                    >
                                        Đặt lại
                                    </Button>
                                    <SheetClose asChild>
                                        <Button
                                            className="flex-1"
                                            onClick={applyFilters}
                                        >
                                            Áp dụng
                                        </Button>
                                    </SheetClose>
                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="hidden sm:flex gap-2">
                    <Select
                        onValueChange={(value) => {
                            if (!filters.type.includes(value)) {
                                setFilters({
                                    ...filters,
                                    type: [...filters.type, value],
                                });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Loại sân" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="football">
                                Sân bóng đá
                            </SelectItem>
                            <SelectItem value="volleyball">
                                Sân bóng chuyền
                            </SelectItem>
                            <SelectItem value="basketball">
                                Sân bóng rổ
                            </SelectItem>
                            <SelectItem value="badminton">
                                Sân cầu lông
                            </SelectItem>
                            <SelectItem value="tennis">Sân tennis</SelectItem>
                            <SelectItem value="swimming">Hồ bơi</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        onValueChange={(value) => {
                            if (!filters.status.includes(value)) {
                                setFilters({
                                    ...filters,
                                    status: [...filters.status, value],
                                });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="maintenance">
                                Đang bảo trì
                            </SelectItem>
                            <SelectItem value="inactive">
                                Không hoạt động
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.priceRangeFilter}
                        onValueChange={(value) => {
                            setFilters({
                                ...filters,
                                priceRangeFilter: value,
                            });
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Khoảng giá" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả giá</SelectItem>
                            <SelectItem value="0-200000">
                                Dưới 200.000đ
                            </SelectItem>
                            <SelectItem value="200000-400000">
                                200.000đ - 400.000đ
                            </SelectItem>
                            <SelectItem value="400000-600000">
                                400.000đ - 600.000đ
                            </SelectItem>
                            <SelectItem value="600000-800000">
                                600.000đ - 800.000đ
                            </SelectItem>
                            <SelectItem value="800000-1000000">
                                800.000đ - 1.000.000đ
                            </SelectItem>
                            <SelectItem value="1000000+">
                                Trên 1.000.000đ
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearAllFilters}
                            className="text-red-500 hover:text-red-700"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {(filters.type.length > 0 ||
                filters.status.length > 0 ||
                filters.priceRangeFilter !== "all") && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-500 pt-1">
                        Bộ lọc đang áp dụng:
                    </span>

                    {filters.type.map((type) => (
                        <Badge key={type} variant="outline">
                            {getTypeName(type)}
                            <button
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                onClick={() => removeTypeFilter(type)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}

                    {filters.status.map((status) => (
                        <Badge key={status} variant="outline">
                            {getStatusName(status)}
                            <button
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                onClick={() => removeStatusFilter(status)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}

                    {filters.priceRangeFilter !== "all" && (
                        <Badge variant="outline">
                            {getPriceRangeName(filters.priceRangeFilter)}
                            <button
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                onClick={removePriceFilter}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
