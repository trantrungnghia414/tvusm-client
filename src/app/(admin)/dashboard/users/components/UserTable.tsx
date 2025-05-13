import React from "react";
import { User } from "../types/userTypes";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreVertical,
    Edit,
    Trash2,
    // Check,
    // X,
    UserX,
    UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserTableProps {
    users: User[];
    onDelete: (userId: number) => void;
    onToggleStatus: (userId: number, newStatus: string) => void;
    onEdit: (userId: number) => void;
}

export default function UserTable({
    users,
    onDelete,
    onToggleStatus,
    onEdit,
}: UserTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
        null
    );

    const handleDeleteClick = (userId: number) => {
        setSelectedUserId(userId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedUserId) {
            onDelete(selectedUserId);
            setDeleteDialogOpen(false);
        }
    };

    // Thêm hàm để xử lý đường dẫn avatar
    const getImageUrl = (path: string | undefined) => {
        if (!path) return null;

        // Nếu đường dẫn đã là URL đầy đủ, giữ nguyên
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Nếu đường dẫn bắt đầu bằng /uploads, thêm domain của server
        return `http://localhost:3000${path}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    };

    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-red-100 text-red-800">
                        Quản trị viên
                    </Badge>
                );
            case "manager":
                return (
                    <Badge className="bg-purple-100 text-purple-800">
                        Quản lý
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-blue-100 text-blue-800">
                        Khách hàng
                    </Badge>
                );
        }
    };

    const getStatusBadge = (user: User) => {
        if (!user.is_verified) {
            return (
                <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800 border-orange-200"
                >
                    Chưa xác thực
                </Badge>
            );
        }

        return user.status === "active" ? (
            <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-200"
            >
                Đang hoạt động
            </Badge>
        ) : (
            <Badge
                variant="outline"
                className="bg-gray-100 text-gray-800 border-gray-200"
            >
                Tạm khóa
            </Badge>
        );
    };

    if (users.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-white">
                <p className="text-gray-500">Không tìm thấy người dùng nào</p>
            </div>
        );
    }

    return (
        <>
            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">STT</TableHead>
                            <TableHead className="min-w-[180px]">
                                Thông tin
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                Email
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Vai trò
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                Trạng thái
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                Ngày tạo
                            </TableHead>
                            <TableHead className="text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.user_id}>
                                <TableCell className="font-medium">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            {user.avatar ? (
                                                <AvatarImage
                                                    src={
                                                        getImageUrl(
                                                            user.avatar
                                                        ) || undefined
                                                    }
                                                    alt={user.username}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <AvatarFallback>
                                                    {getInitials(
                                                        user.fullname ||
                                                            user.username
                                                    )}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {user.fullname || user.username}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {user.email}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {getRoleBadge(user.role)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {getStatusBadge(user)}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {formatDate(user.created_at)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {user.role === "admin" ? (
                                        // Nếu là admin, không hiển thị menu thao tác
                                        <span className="text-xs text-gray-500 italic">
                                            Admin
                                        </span>
                                    ) : (
                                        // Nếu không phải admin, hiển thị menu thao tác như bình thường
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onEdit(user.user_id)
                                                    }
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Chỉnh sửa</span>
                                                </DropdownMenuItem>

                                                {user.status === "active" ? (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onToggleStatus(
                                                                user.user_id,
                                                                "inactive"
                                                            )
                                                        }
                                                    >
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        <span>
                                                            Khóa tài khoản
                                                        </span>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onToggleStatus(
                                                                user.user_id,
                                                                "active"
                                                            )
                                                        }
                                                    >
                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                        <span>
                                                            Kích hoạt tài khoản
                                                        </span>
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            user.user_id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Xóa người dùng</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog xác nhận xóa người dùng */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa người dùng
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa người dùng này? Hành động
                            này không thể hoàn tác và tất cả dữ liệu người dùng
                            sẽ bị mất.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
