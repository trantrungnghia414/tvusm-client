"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Equipment, EquipmentCategory } from "../types/equipmentTypes";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus, ImageIcon, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Venue {
    venue_id: number;
    name: string;
}

interface EquipmentFormProps {
    equipment?: Equipment;
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

export default function EquipmentForm({
    equipment,
    onSubmit,
    isSubmitting = false,
}: EquipmentFormProps) {
    // Form fields
    const [name, setName] = useState(equipment?.name || "");
    const [code, setCode] = useState(equipment?.code || "");
    const [description, setDescription] = useState(
        equipment?.description || ""
    );
    const [categoryId, setCategoryId] = useState<string>(
        equipment?.category_id?.toString() || ""
    );
    const [venueId, setVenueId] = useState<string>(
        equipment?.venue_id?.toString() || "none"
    );
    const [status, setStatus] = useState<
        "available" | "in_use" | "maintenance" | "unavailable"
    >(
        (equipment?.status as
            | "available"
            | "in_use"
            | "maintenance"
            | "unavailable") || "available"
    );
    const [quantity, setQuantity] = useState(
        equipment?.quantity?.toString() || "1"
    );
    const [availableQuantity, setAvailableQuantity] = useState(
        equipment?.available_quantity?.toString() || "1"
    );
    const [purchaseDate, setPurchaseDate] = useState(
        equipment?.purchase_date || ""
    );
    const [purchasePrice, setPurchasePrice] = useState(
        equipment?.purchase_price?.toString() || ""
    );
    const [rentalFee, setRentalFee] = useState(
        equipment?.rental_fee?.toString() || "0"
    );
    const [imagePreview, setImagePreview] = useState(equipment?.image || null);

    // Options
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingVenues, setIsLoadingVenues] = useState(false);

    // Danh mục mới
    const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch danh mục thiết bị
    const fetchCategoriesData = useCallback(async () => {
        try {
            setIsLoadingCategories(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/equipment/categories", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách danh mục");
            }

            const data = await response.json();
            setCategories(data);

            // Nếu chưa chọn category và có dữ liệu, chọn category đầu tiên
            if (!categoryId && data.length > 0) {
                setCategoryId(data[0].category_id.toString());
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Không thể tải danh sách danh mục");
        } finally {
            setIsLoadingCategories(false);
        }
    }, [categoryId]);

    // Fetch địa điểm
    const fetchVenuesData = useCallback(async () => {
        try {
            setIsLoadingVenues(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/venues", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải danh sách địa điểm");
            }

            const data = await response.json();
            setVenues(data);
        } catch (error) {
            console.error("Error fetching venues:", error);
            toast.error("Không thể tải danh sách địa điểm");
        } finally {
            setIsLoadingVenues(false);
        }
    }, []);

    // Fetch data khi component mount
    useEffect(() => {
        fetchCategoriesData();
        fetchVenuesData();
    }, [fetchCategoriesData, fetchVenuesData]);

    // Xử lý khi upload ảnh
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
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận các định dạng ảnh: JPG, PNG, GIF, WEBP");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Hiển thị preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Xử lý thêm danh mục mới
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Vui lòng nhập tên danh mục");
            return;
        }

        setIsCreatingCategory(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                return;
            }

            const response = await fetchApi("/equipment/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newCategoryName,
                    description: newCategoryDescription || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo danh mục");
            }

            const newCategory = await response.json();

            // Thêm danh mục mới vào danh sách và chọn nó
            setCategories([...categories, newCategory]);
            setCategoryId(newCategory.category_id.toString());

            // Reset form thêm danh mục
            setNewCategoryName("");
            setNewCategoryDescription("");
            setNewCategoryDialogOpen(false);

            toast.success("Tạo danh mục thành công");
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo danh mục"
            );
        } finally {
            setIsCreatingCategory(false);
        }
    };

    // Xử lý nộp form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !code || !categoryId) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
            return;
        }

        // Kiểm tra số lượng
        const quantityNum = Number(quantity);
        const availableQuantityNum = Number(availableQuantity);

        if (isNaN(quantityNum) || quantityNum <= 0) {
            toast.error("Số lượng phải là số dương");
            return;
        }

        if (isNaN(availableQuantityNum) || availableQuantityNum < 0) {
            toast.error("Số lượng khả dụng phải là số không âm");
            return;
        }

        if (availableQuantityNum > quantityNum) {
            toast.error("Số lượng khả dụng không thể lớn hơn tổng số lượng");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("code", code);
        formData.append("category_id", categoryId);
        formData.append("quantity", quantity);
        formData.append("available_quantity", availableQuantity);
        formData.append("status", status);

        if (description) formData.append("description", description);
        if (purchaseDate) formData.append("purchase_date", purchaseDate);
        if (purchasePrice) formData.append("purchase_price", purchasePrice);
        if (rentalFee) formData.append("rental_fee", rentalFee);
        if (venueId && venueId !== "none") formData.append("venue_id", venueId);

        // Thêm file ảnh nếu có
        const imageInput = fileInputRef.current?.files?.[0];
        if (imageInput) {
            formData.append("image", imageInput);
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin cơ bản */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-medium">
                                    Tên thiết bị{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên thiết bị"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code" className="font-medium">
                                    Mã thiết bị{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Nhập mã thiết bị (VD: BB-001, VT-002)"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="description"
                                    className="font-medium"
                                >
                                    Mô tả
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description || ""}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Nhập mô tả thiết bị"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="category"
                                        className="font-medium"
                                    >
                                        Danh mục{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={categoryId}
                                        onValueChange={setCategoryId}
                                        disabled={isLoadingCategories}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingCategories
                                                        ? "Đang tải..."
                                                        : "Chọn danh mục"
                                                }
                                            />
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

                                            {/* Nút thêm danh mục mới - giống News */}
                                            <div className="px-2 py-1.5">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="w-full text-left text-sm flex items-center gap-2 text-blue-600"
                                                    onClick={() =>
                                                        setNewCategoryDialogOpen(
                                                            true
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    <span className="font-medium">
                                                        Thêm danh mục mới
                                                    </span>
                                                </Button>
                                            </div>
                                        </SelectContent>
                                    </Select>

                                    {categories.length === 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={() =>
                                                setNewCategoryDialogOpen(true)
                                            }
                                        >
                                            Chưa có danh mục. Thêm mới?
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="venue"
                                        className="font-medium"
                                    >
                                        Cơ sở/Địa điểm
                                    </Label>
                                    <Select
                                        value={venueId}
                                        onValueChange={setVenueId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingVenues
                                                        ? "Đang tải..."
                                                        : "Chọn cơ sở"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Không chọn
                                            </SelectItem>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="quantity"
                                        className="font-medium"
                                    >
                                        Tổng số lượng{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(e.target.value)
                                        }
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="availableQuantity"
                                        className="font-medium"
                                    >
                                        Số lượng khả dụng{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="availableQuantity"
                                        type="number"
                                        value={availableQuantity}
                                        onChange={(e) =>
                                            setAvailableQuantity(e.target.value)
                                        }
                                        min="0"
                                        max={quantity}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="status"
                                        className="font-medium"
                                    >
                                        Trạng thái{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={(value) =>
                                            setStatus(
                                                value as
                                                    | "available"
                                                    | "in_use"
                                                    | "maintenance"
                                                    | "unavailable"
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">
                                                Khả dụng
                                            </SelectItem>
                                            <SelectItem value="in_use">
                                                Đang sử dụng
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Đang bảo trì
                                            </SelectItem>
                                            <SelectItem value="unavailable">
                                                Không khả dụng
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="purchaseDate"
                                        className="font-medium"
                                    >
                                        Ngày mua
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="purchaseDate"
                                            type="date"
                                            value={purchaseDate}
                                            onChange={(e) =>
                                                setPurchaseDate(e.target.value)
                                            }
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 6h13M8 12h13m-7 6h7"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="purchasePrice"
                                        className="font-medium"
                                    >
                                        Giá mua (VNĐ)
                                    </Label>
                                    <Input
                                        id="purchasePrice"
                                        type="number"
                                        value={purchasePrice}
                                        onChange={(e) =>
                                            setPurchasePrice(e.target.value)
                                        }
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="rentalFee"
                                        className="font-medium"
                                    >
                                        Phí thuê/giờ (VNĐ)
                                    </Label>
                                    <Input
                                        id="rentalFee"
                                        type="number"
                                        value={rentalFee}
                                        onChange={(e) =>
                                            setRentalFee(e.target.value)
                                        }
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hình ảnh và các tùy chọn */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image" className="font-medium">
                                    Hình ảnh thiết bị
                                </Label>

                                <div className="flex items-center justify-center">
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 w-full text-center">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <div
                                                    className="mx-auto mb-2 max-h-[200px] rounded"
                                                    style={{
                                                        backgroundImage: `url(${imagePreview})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition:
                                                            "center",
                                                        width: "100%",
                                                        height: "200px",
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-8 w-8"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        if (
                                                            fileInputRef.current
                                                        ) {
                                                            fileInputRef.current.value =
                                                                "";
                                                        }
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="py-6 flex flex-col items-center justify-center text-gray-500">
                                                <ImageIcon className="h-12 w-12 mb-2" />
                                                <p className="mb-1">
                                                    Kéo thả hoặc nhấn chọn ảnh
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    JPG, PNG, GIF, WEBP (Tối đa
                                                    5MB)
                                                </p>
                                            </div>
                                        )}
                                        <Input
                                            id="image"
                                            type="file"
                                            className={cn(
                                                "mt-2",
                                                imagePreview
                                                    ? ""
                                                    : "opacity-0 h-0"
                                            )}
                                            onChange={handleImageChange}
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            ref={fileInputRef}
                                        />
                                        {!imagePreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                            >
                                                <ImageIcon className="h-4 w-4 mr-2" />
                                                Chọn ảnh
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/equipments")}
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                        <Button
                            type="submit"
                            className="min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : equipment ? (
                                "Cập nhật"
                            ) : (
                                "Thêm thiết bị"
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialog thêm danh mục mới */}
            <Dialog
                open={newCategoryDialogOpen}
                onOpenChange={setNewCategoryDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm danh mục mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin để thêm danh mục thiết bị mới vào hệ
                            thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-category-name">
                                Tên danh mục{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="new-category-name"
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                placeholder="Nhập tên danh mục"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-category-description">
                                Mô tả
                            </Label>
                            <Textarea
                                id="new-category-description"
                                value={newCategoryDescription}
                                onChange={(e) =>
                                    setNewCategoryDescription(e.target.value)
                                }
                                placeholder="Nhập mô tả danh mục"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setNewCategoryDialogOpen(false)}
                            disabled={isCreatingCategory}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={isCreatingCategory}
                        >
                            {isCreatingCategory ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang thêm...
                                </>
                            ) : (
                                "Thêm danh mục"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </form>
    );
}
