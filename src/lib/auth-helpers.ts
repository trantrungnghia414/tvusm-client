import { toast } from "sonner";

// Định nghĩa một interface cho userData
interface UserData {
    role?: string;
    user_id?: number;
    username?: string;
    email?: string;
    avatar?: string;
    name?: string;
}

export function handleAuthSuccess(token: string, userData: UserData) {
    // Lưu token vào localStorage
    localStorage.setItem("token", token);

    // Hiển thị thông báo thành công
    toast.success("Đăng nhập thành công!");

    // Chuyển hướng dựa theo role
    setTimeout(() => {
        if (userData?.role === "admin") {
            window.location.href = "/dashboard";
        } else {
            window.location.href = "/";
        }
    }, 1000);
}
