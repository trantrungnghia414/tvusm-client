// "use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RegisterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToLogin: () => void;
}

export default function Register({
    open,
    onOpenChange,
    onSwitchToLogin,
}: RegisterDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm sm:rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-center">Đăng ký</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Họ tên</Label>
                        <Input
                            id="username"
                            placeholder="Họ và tên"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Mật khẩu"
                            autoComplete="off"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="hover:cursor-pointer w-full"
                    >
                        Đăng ký
                    </Button>
                </form>
                <div className="mt-4 text-sm text-center text-gray-500">
                    Bạn đã có tài khoản?{" "}
                    <Button
                        variant="link"
                        onClick={onSwitchToLogin}
                        className="text-blue-500 hover:underline hover:cursor-pointer"
                    >
                        Đăng nhập
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
