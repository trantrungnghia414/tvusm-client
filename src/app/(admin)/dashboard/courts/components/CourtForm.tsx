import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

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
import { Switch } from "@/components/ui/switch";
import { Court, CourtType, Venue } from "../types/courtTypes";

interface CourtFormProps {
    court?: Court;
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function CourtForm({ court, onSubmit }: CourtFormProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [venueId, setVenueId] = useState("");
    const [typeId, setTypeId] = useState("");
    const [status, setStatus] = useState<
        "available" | "booked" | "maintenance"
    >("available");
    const [isIndoor, setIsIndoor] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [venues, setVenues] = useState<Venue[]>([]);
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Lấy danh sách nhà thi đấu và loại sân
    useEffect(() => {
        const fetchVenuesAndTypes = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Lấy danh sách nhà thi đấu
                const venuesResponse = await fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (venuesResponse.ok) {
                    const venuesData = await venuesResponse.json();
                    setVenues(venuesData);
                }

                // Lấy danh sách loại sân
                const typesResponse = await fetchApi("/court-types", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (typesResponse.ok) {
                    const typesData = await typesResponse.json();
                    setCourtTypes(typesData);
                }
            } catch (error) {
                console.error("Error fetching venues and types:", error);
                toast.error("Không thể tải dữ liệu nhà thi đấu và loại sân");
            }
        };

        fetchVenuesAndTypes();
    }, []);

    // Điền sẵn thông tin khi ở chế độ edit
    useEffect(() => {
        if (court) {
            setName(court.name);
            setCode(court.code);
            setDescription(court.description || "");
            setHourlyRate(court.hourly_rate.toString());
            setVenueId(court.venue_id.toString());
            setTypeId(court.type_id.toString());
            setStatus(court.status);
            setIsIndoor(court.is_indoor);

            if (court.image) {
                setImagePreview(getImageUrl(court.image));
            }
        }
    }, [court]);

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
            toast.error("Vui lòng nhập tên sân");
            return;
        }

        if (!code.trim()) {
            toast.error("Vui lòng nhập mã sân");
            return;
        }

        if (!venueId) {
            toast.error("Vui lòng chọn nhà thi đấu");
            return;
        }

        if (!typeId) {
            toast.error("Vui lòng chọn loại sân");
            return;
        }

        // Kiểm tra giá thuê
        if (
            !hourlyRate ||
            isNaN(Number(hourlyRate)) ||
            Number(hourlyRate) < 0
        ) {
            toast.error("Giá thuê phải là số dương");
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("code", code);
            formData.append("description", description);
            formData.append("venue_id", venueId);
            formData.append("type_id", typeId);
            formData.append("hourly_rate", hourlyRate);
            formData.append("status", status);
            formData.append("is_indoor", isIndoor ? "true" : "false");

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
                        Tên sân <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên sân"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">
                        Mã sân <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Nhập mã sân (vd: CL01, BD02)"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="venue">
                        Nhà thi đấu <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={venueId}
                        onValueChange={(value) => setVenueId(value)}
                    >
                        <SelectTrigger id="venue">
                            <SelectValue placeholder="Chọn nhà thi đấu" />
                        </SelectTrigger>
                        <SelectContent>
                            {venues.map((venue) => (
                                <SelectItem
                                    key={venue.venue_id}
                                    value={venue.venue_id.toString()}
                                >
                                    {venue.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">
                        Loại sân <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={typeId}
                        onValueChange={(value) => setTypeId(value)}
                    >
                        <SelectTrigger id="type">
                            <SelectValue placeholder="Chọn loại sân" />
                        </SelectTrigger>
                        <SelectContent>
                            {courtTypes.map((type) => (
                                <SelectItem
                                    key={type.type_id}
                                    value={type.type_id.toString()}
                                >
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả về sân"
                    rows={4}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="hourlyRate">
                        Giá thuê/giờ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="hourlyRate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || parseFloat(value) >= 0) {
                                setHourlyRate(value);
                            }
                        }}
                        placeholder="Nhập giá thuê theo giờ"
                        min="0"
                        step="1000"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                        value={status}
                        onValueChange={(value) =>
                            setStatus(
                                value as "available" | "booked" | "maintenance"
                            )
                        }
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="available">
                                Sẵn sàng sử dụng
                            </SelectItem>
                            <SelectItem value="maintenance">
                                Đang bảo trì
                            </SelectItem>
                            <SelectItem value="booked">Đã đặt</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="isIndoor"
                    checked={isIndoor}
                    onCheckedChange={setIsIndoor}
                />
                <Label htmlFor="isIndoor">Sân trong nhà</Label>
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
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-16 w-16 rounded object-cover border"
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
                    onClick={() => router.push("/dashboard/courts")}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {court ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
