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

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSwitchToRegister: () => void;
}

export default function Login({
    open,
    onOpenChange,
    onSwitchToRegister,
}: LoginDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm sm:rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-center">Đăng nhập</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
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
                        className="w-full hover:cursor-pointer"
                    >
                        Đăng nhập
                    </Button>
                </form>
                <div className="mt-4 text-sm text-center text-gray-500">
                    Chưa có tài khoản?{" "}
                    <Button
                        variant="link"
                        onClick={onSwitchToRegister}
                        className="text-blue-500 hover:underline hover:cursor-pointer"
                    >
                        Đăng ký
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
