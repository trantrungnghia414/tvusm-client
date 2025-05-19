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
import { Equipment } from "../types/equipmentTypes";
import Image from "next/image";

// Định nghĩa mảng các trạng thái
const EQUIPMENT_STATUSES = [
    { value: "available", label: "Sẵn sàng" },
    { value: "in_use", label: "Đang sử dụng" },
    { value: "maintenance", label: "Bảo trì" },
    { value: "unavailable", label: "Không khả dụng" },
];

interface Category {
    category_id: number;
    name: string;
    description?: string;
}

interface Venue {
    venue_id: number;
    name: string;
    location: string;
    status: string;
}

interface EquipmentFormProps {
    equipment?: Equipment | null;
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function EquipmentForm({
    equipment,
    onSubmit,
}: EquipmentFormProps) {
    // Form states
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [venueId, setVenueId] = useState<string>("");
    const [quantity, setQuantity] = useState("1");
    const [availableQuantity, setAvailableQuantity] = useState("1");
    const [status, setStatus] = useState<string>("available");
    const [description, setDescription] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [rentalFee, setRentalFee] = useState("0");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Data lists - thay đổi tại đây
    const [categories, setCategories] = useState<Category[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);

    // Loading state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Lấy danh sách danh mục và nhà thi đấu
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) return;

                // Lấy dữ liệu đồng thời để tăng hiệu suất
                const [categoriesResponse, venuesResponse] = await Promise.all([
                    fetchApi("/equipment/categories", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/venues", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData);
                }

                if (venuesResponse.ok) {
                    const venuesData = await venuesResponse.json();
                    setVenues(venuesData);
                }

                // Điền thông tin thiết bị sau khi đã tải xong dữ liệu
                if (equipment) {
                    setName(equipment.name);
                    setCode(equipment.code);
                    setDescription(equipment.description || "");
                    setQuantity(equipment.quantity.toString());
                    setAvailableQuantity(
                        equipment.available_quantity.toString()
                    );
                    setCategoryId(equipment.category_id.toString());
                    setStatus(equipment.status);
                    setRentalFee(equipment.rental_fee.toString());

                    if (equipment.venue_id) {
                        setVenueId(equipment.venue_id.toString());
                    } else {
                        setVenueId("");
                    }

                    if (equipment.purchase_date) {
                        setPurchaseDate(
                            new Date(equipment.purchase_date)
                                .toISOString()
                                .split("T")[0]
                        );
                    }

                    if (equipment.purchase_price) {
                        setPurchasePrice(equipment.purchase_price.toString());
                    }

                    if (equipment.image) {
                        setImagePreview(getImageUrl(equipment.image));
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu danh mục và nhà thi đấu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [equipment]);

    const getImageUrl = (path: string | null) => {
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
            toast.error("Kích thước hình ảnh không được vượt quá 5MB");
            return;
        }

        // Kiểm tra loại file
        if (!file.type.includes("image")) {
            toast.error("Vui lòng chỉ chọn file hình ảnh");
            return;
        }

        // Tạo URL xem trước
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!name) {
            toast.error("Vui lòng nhập tên thiết bị");
            return;
        }

        if (!code) {
            toast.error("Vui lòng nhập mã thiết bị");
            return;
        }

        if (!categoryId) {
            toast.error("Vui lòng chọn danh mục thiết bị");
            return;
        }

        const quantityNum = parseInt(quantity);
        const availableQuantityNum = parseInt(availableQuantity);

        if (isNaN(quantityNum) || quantityNum <= 0) {
            toast.error("Số lượng phải là số dương");
            return;
        }

        if (isNaN(availableQuantityNum) || availableQuantityNum < 0) {
            toast.error("Số lượng khả dụng không được âm");
            return;
        }

        if (availableQuantityNum > quantityNum) {
            toast.error("Số lượng khả dụng không thể lớn hơn tổng số lượng");
            return;
        }

        const rentalFeeNum = parseFloat(rentalFee);
        if (isNaN(rentalFeeNum) || rentalFeeNum < 0) {
            toast.error("Phí thuê không được là số âm");
            return;
        }

        if (purchasePrice) {
            const purchasePriceNum = parseFloat(purchasePrice);
            if (isNaN(purchasePriceNum) || purchasePriceNum < 0) {
                toast.error("Giá mua phải là số dương");
                return;
            }
        }

        setSaving(true);

        try {
            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append("name", name);
            formData.append("code", code);
            formData.append("category_id", categoryId);
            formData.append("quantity", quantity);
            formData.append("available_quantity", availableQuantity);
            formData.append("status", status);
            formData.append("rental_fee", rentalFee);

            if (description) {
                formData.append("description", description);
            }

            if (purchaseDate) {
                formData.append("purchase_date", purchaseDate);
            }

            if (purchasePrice) {
                formData.append("purchase_price", purchasePrice);
            }

            if (venueId) {
                formData.append("venue_id", venueId);
            } else {
                formData.append("venue_id", "null"); // Gửi null khi không có venue
            }

            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting equipment form:", error);
            toast.error("Có lỗi xảy ra khi lưu thông tin");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tên thiết bị */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Tên thiết bị <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên thiết bị"
                        disabled={loading || saving}
                    />
                </div>

                {/* Mã thiết bị */}
                <div className="space-y-2">
                    <Label htmlFor="code">
                        Mã thiết bị <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ví dụ: TB001, BBR01"
                        disabled={loading || saving || !!equipment} // Không cho phép sửa mã khi cập nhật
                    />
                    {equipment && (
                        <p className="text-xs text-muted-foreground">
                            Mã thiết bị không thể thay đổi sau khi tạo
                        </p>
                    )}
                </div>

                {/* Danh mục */}
                <div className="space-y-2">
                    <Label htmlFor="category">
                        Danh mục <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={categoryId}
                        onValueChange={setCategoryId}
                        disabled={loading || saving}
                    >
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.category_id}
                                    value={category.category_id.toString()}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Khu vực/Nhà thi đấu */}
                <div className="space-y-2">
                    <Label htmlFor="venue">Khu vực / Nhà thi đấu</Label>
                    <Select
                        value={venueId}
                        onValueChange={setVenueId}
                        disabled={loading || saving}
                    >
                        <SelectTrigger id="venue">
                            <SelectValue placeholder="Chọn khu vực" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Thiết bị chung</SelectItem>
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
                    <p className="text-xs text-muted-foreground">
                        Để trống nếu là thiết bị sử dụng chung
                    </p>
                </div>

                {/* Số lượng */}
                <div className="space-y-2">
                    <Label htmlFor="quantity">
                        Tổng số lượng <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Nhập số lượng"
                        disabled={loading || saving}
                    />
                </div>

                {/* Số lượng khả dụng */}
                <div className="space-y-2">
                    <Label htmlFor="availableQuantity">
                        Số lượng khả dụng{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="availableQuantity"
                        type="number"
                        min="0"
                        max={quantity}
                        value={availableQuantity}
                        onChange={(e) => setAvailableQuantity(e.target.value)}
                        placeholder="Nhập số lượng khả dụng"
                        disabled={loading || saving}
                    />
                    <p className="text-xs text-muted-foreground">
                        Số lượng có thể sử dụng (không vượt quá tổng số lượng)
                    </p>
                </div>

                {/* Trạng thái */}
                <div className="space-y-2">
                    <Label htmlFor="status">
                        Trạng thái <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={status}
                        onValueChange={setStatus}
                        disabled={loading || saving}
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {EQUIPMENT_STATUSES.map((status) => (
                                <SelectItem
                                    key={status.value}
                                    value={status.value}
                                >
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Phí thuê */}
                <div className="space-y-2">
                    <Label htmlFor="rentalFee">
                        Phí thuê (VNĐ/giờ){" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="rentalFee"
                        type="number"
                        min="0"
                        step="1000"
                        value={rentalFee}
                        onChange={(e) => setRentalFee(e.target.value)}
                        placeholder="Nhập phí thuê"
                        disabled={loading || saving}
                    />
                    <p className="text-xs text-muted-foreground">
                        Nhập 0 nếu miễn phí
                    </p>
                </div>

                {/* Ngày mua */}
                <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Ngày mua</Label>
                    <Input
                        id="purchaseDate"
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        placeholder="Chọn ngày mua"
                        disabled={loading || saving}
                    />
                </div>

                {/* Giá mua */}
                <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Giá mua (VNĐ)</Label>
                    <Input
                        id="purchasePrice"
                        type="number"
                        min="0"
                        step="1000"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="Nhập giá mua"
                        disabled={loading || saving}
                    />
                </div>

                {/* Mô tả */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả thiết bị"
                        rows={3}
                        disabled={loading || saving}
                    />
                </div>

                {/* Hình ảnh */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="image">Hình ảnh</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            disabled={loading || saving}
                            className="max-w-sm"
                        />
                        {imagePreview && (
                            <div className="relative">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                    disabled={loading || saving}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Upload hình ảnh của thiết bị (JPG, PNG, tối đa 5MB)
                    </p>
                </div>
            </div>

            {/* Nút submit */}
            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/equipment")}
                    disabled={saving}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={saving || loading}>
                    {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {equipment ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
