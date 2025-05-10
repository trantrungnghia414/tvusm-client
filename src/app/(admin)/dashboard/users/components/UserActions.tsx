import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserActionsProps {
    onAddUser: () => void;
}

export default function UserActions({ onAddUser }: UserActionsProps) {
    return (
        <div className="flex gap-2">
            <Button onClick={onAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm người dùng
            </Button>
        </div>
    );
}
