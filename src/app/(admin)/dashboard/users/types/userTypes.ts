export interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    role: string;
    status: "active" | "inactive" | "banned";
    phone?: string | null;
    created_at: string;
    is_verified: boolean;
    avatar?: string | null;
}
