import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Venue } from "../types/venueTypes";
import Image from "next/image";

interface VenueFormProps {
    venue?: Venue;
    onSubmit: (formData: FormData) => void;
}

export default function VenueForm({ venue, onSubmit }: VenueFormProps) {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");
    const [status, setStatus] = useState<"active" | "maintenance" | "inactive">(
        "active"
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Điền sẵn thông tin khi ở chế độ edit
    useEffect(() => {
        if (venue) {
            setName(venue.name);
            setLocation(venue.location);
            setDescription(venue.description || "");
            setCapacity(venue.capacity?.toString() || "");
            setStatus(venue.status);

            if (venue.image) {
                setImagePreview(getImageUrl(venue.image));
            }
        }
    }, [venue]);

    const getImageUrl = (path: string | undefined | null) => {
        if (!path) return null;

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Thêm timestamp để tránh cache
        const timestamp = new Date().getTime();

        return `http://localhost:3000${path}?t=${timestamp}`;
    };

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

    const clearImage = () => {
        if (imagePreview) {
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
            toast.error("Vui lòng nhập tên nhà thi đấu");
            return;
        }

        if (!location.trim()) {
            toast.error("Vui lòng nhập địa điểm");
            return;
        }

        // Kiểm tra sức chứa nếu có
        if (capacity && (isNaN(Number(capacity)) || Number(capacity) < 0)) {
            toast.error("Sức chứa phải là số dương");
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("location", location);
            formData.append("description", description);

            // Chuyển đổi capacity sang số trước khi gửi
            if (capacity) {
                const capacityNum = parseInt(capacity, 10);
                formData.append("capacity", capacityNum.toString());
            }

            formData.append("status", status);
            if (imageFile) formData.append("image", imageFile);

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
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Tên nhà thi đấu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên nhà thi đấu"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">
                        Địa điểm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Nhập địa điểm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả về nhà thi đấu"
                    rows={4}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="capacity">Sức chứa</Label>
                    <Input
                        id="capacity"
                        type="number"
                        value={capacity}
                        // onChange={(e) => setCapacity(e.target.value)}
                        onChange={(e) => {
                            // Chỉ chấp nhận số nguyên dương hoặc để trống
                            const value = e.target.value;
                            if (
                                value === "" ||
                                (parseInt(value) >= 0 && !value.includes("."))
                            ) {
                                setCapacity(value);
                            }
                        }}
                        placeholder="Nhập sức chứa"
                        min="0"
                        step="1"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            setStatus(
                                value as "active" | "maintenance" | "inactive"
                            )
                        }
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">
                                Đang hoạt động
                            </SelectItem>
                            <SelectItem value="maintenance">
                                Đang bảo trì
                            </SelectItem>
                            <SelectItem value="inactive">
                                Ngừng hoạt động
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Hình ảnh</Label>
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
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/venues")}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {venue ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
