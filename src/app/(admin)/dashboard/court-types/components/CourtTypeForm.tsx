import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourtType } from "../types";

interface CourtTypeFormProps {
    courtType?: CourtType;
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function CourtTypeForm({
    courtType,
    onSubmit,
}: CourtTypeFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [standardSize, setStandardSize] = useState("");
    const [saving, setSaving] = useState(false);

    // Thêm state cho ảnh
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();

    // Điền sẵn thông tin khi ở chế độ edit
    useEffect(() => {
        if (courtType) {
            setName(courtType.name);
            setDescription(courtType.description || "");
            setStandardSize(courtType.standard_size || "");

            // Hiển thị ảnh nếu có
            if (courtType.image) {
                setImagePreview(getImageUrl(courtType.image));
            }
        }
    }, [courtType]);

    // Hàm lấy URL ảnh
    const getImageUrl = (path: string | undefined | null) => {
        if (!path) return null;

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();
        return `http://localhost:3000${path}?t=${timestamp}`;
    };

    // Xử lý khi chọn ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Kiểm tra định dạng file
        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/gif",
        ];
        if (!validTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Lưu file và tạo URL xem trước
        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    // Xóa ảnh đã chọn
    const clearImage = () => {
        if (imagePreview && imagePreview.startsWith("blob:")) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra thông tin trước khi gửi
        if (!name.trim()) {
            toast.error("Vui lòng nhập tên loại sân");
            return;
        }

        setSaving(true);

        try {
            // Thay đổi cách gửi dữ liệu để hỗ trợ upload file
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description.trim() || "");
            formData.append("standard_size", standardSize.trim() || "");

            // Thêm file ảnh nếu có
            if (imageFile) {
                formData.append("image", imageFile);
            }

            await onSubmit(formData);
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

            {/* Thêm phần upload ảnh */}
            <div className="space-y-2">
                <Label htmlFor="image">Hình ảnh minh họa</Label>
                <div className="flex items-center gap-4">
                    <Input
                        ref={fileInputRef}
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <div className="relative">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded object-cover border"
                                unoptimized={true}
                            />
                            <button
                                type="button"
                                onClick={clearImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 h-6 w-6 flex items-center justify-center"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500">
                    Hình ảnh minh họa cho loại sân (tối đa 5MB)
                </p>
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
