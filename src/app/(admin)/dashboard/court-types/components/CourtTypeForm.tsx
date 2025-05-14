import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourtType } from "../types";

interface CourtTypeFormProps {
    courtType?: CourtType;
    onSubmit: (formData: {
        name: string;
        description?: string;
        standard_size?: string;
    }) => Promise<void>;
}

export default function CourtTypeForm({
    courtType,
    onSubmit,
}: CourtTypeFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [standardSize, setStandardSize] = useState("");
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    // Điền sẵn thông tin khi ở chế độ edit
    useEffect(() => {
        if (courtType) {
            setName(courtType.name);
            setDescription(courtType.description || "");
            setStandardSize(courtType.standard_size || "");
        }
    }, [courtType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra thông tin trước khi gửi
        if (!name.trim()) {
            toast.error("Vui lòng nhập tên loại sân");
            return;
        }

        setSaving(true);

        try {
            await onSubmit({
                name,
                description: description.trim() || undefined,
                standard_size: standardSize.trim() || undefined,
            });
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Có lỗi xảy ra khi lưu dữ liệu");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">
                    Tên loại sân <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên loại sân (VD: Sân bóng rổ, Sân cầu lông...)"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="standard_size">Kích thước tiêu chuẩn</Label>
                <Input
                    id="standard_size"
                    value={standardSize}
                    onChange={(e) => setStandardSize(e.target.value)}
                    placeholder="Nhập kích thước tiêu chuẩn (VD: 28m x 15m)"
                />
                <p className="text-xs text-gray-500">
                    Kích thước tiêu chuẩn theo quy định (dài x rộng)
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả về loại sân này"
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/court-types")}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {courtType ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
