import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    ArrowUpCircle,
    Archive,
    FileText,
    Image,
} from "lucide-react";
import { News } from "../types/newsTypes";

interface NewsTableProps {
    news: News[];
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
    onUpdateStatus: (id: number, status: string) => void;
    confirmDeleteOpen: boolean;
    setConfirmDeleteOpen: (open: boolean) => void;
    confirmDelete: () => void;
}

export default function NewsTable({
    news,
    onDelete,
    onEdit,
    onView,
    onUpdateStatus,
}: // confirmDeleteOpen,
// setConfirmDeleteOpen,
// confirmDelete,
NewsTableProps) {
    const handleDeleteClick = (newsId: number) => {
        onDelete(newsId);
    };

    if (news.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">Chưa có tin tức nào</p>
            </div>
        );
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    // Hàm lấy URL cho thumbnail
    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    };

    return (
        <div className="border rounded-lg bg-white overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">STT</TableHead>
                        <TableHead className="w-[60px]">Ảnh</TableHead>
                        <TableHead className="min-w-[250px]">Tiêu đề</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Lượt xem</TableHead>
                        <TableHead>Ngày đăng</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {news.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="text-center py-10 text-gray-500"
                            >
                                Chưa có tin tức nào
                            </TableCell>
                        </TableRow>
                    ) : (
                        news.map((item, index) => (
                            <TableRow key={item.news_id}>
                                <TableCell className="text-center font-medium text-gray-500">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 relative flex-shrink-0">
                                        {item.thumbnail ? (
                                            <img
                                                src={
                                                    getImageUrl(
                                                        item.thumbnail
                                                    ) || ""
                                                }
                                                alt={item.title}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-500">
                                                <Image className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span
                                            className="font-medium truncate"
                                            title={item.title}
                                        >
                                            {item.title.length > 80
                                                ? `${item.title.substring(
                                                      0,
                                                      80
                                                  )}...`
                                                : item.title}
                                        </span>
                                        {item.is_featured === 1 && (
                                            <Badge
                                                variant="secondary"
                                                className="w-fit mt-1 bg-amber-50 text-amber-600"
                                            >
                                                Nổi bật
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.category_name ||
                                        `ID: ${item.category_id}`}
                                </TableCell>
                                <TableCell>
                                    <NewsStatusBadge status={item.status} />
                                </TableCell>
                                <TableCell>{item.view_count}</TableCell>
                                <TableCell>
                                    {item.published_at
                                        ? formatDate(item.published_at)
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-56"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onView(item.news_id)
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit(item.news_id)
                                                }
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>
                                                Trạng thái
                                            </DropdownMenuLabel>

                                            {item.status !== "published" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            item.news_id,
                                                            "published"
                                                        )
                                                    }
                                                >
                                                    <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>Xuất bản</span>
                                                </DropdownMenuItem>
                                            )}

                                            {item.status !== "draft" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            item.news_id,
                                                            "draft"
                                                        )
                                                    }
                                                >
                                                    <FileText className="mr-2 h-4 w-4 text-amber-500" />
                                                    <span>Lưu nháp</span>
                                                </DropdownMenuItem>
                                            )}

                                            {item.status !== "archived" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            item.news_id,
                                                            "archived"
                                                        )
                                                    }
                                                >
                                                    <Archive className="mr-2 h-4 w-4 text-gray-500" />
                                                    <span>Lưu trữ</span>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        item.news_id
                                                    )
                                                }
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function NewsStatusBadge({ status }: { status: string }) {
    switch (status) {
        case "published":
            return (
                <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                >
                    Đã đăng
                </Badge>
            );
        case "draft":
            return (
                <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200"
                >
                    Nháp
                </Badge>
            );
        case "archived":
            return (
                <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-700 border-gray-300"
                >
                    Đã lưu trữ
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
// TEST THÊM XOÁ SỬA THIẾT BỊ, TẠO TRANG QUẢN LÝ TIN TỨC
