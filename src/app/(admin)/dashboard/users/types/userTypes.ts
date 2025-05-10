export interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    name?: string;
    role: string;
    status: "active" | "inactive";
    phone?: string;
    created_at: string;
    is_verified: boolean;
    avatar?: string;
}