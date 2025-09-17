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
import { fetchApi, getImageUrl } from "@/lib/api";
import { ImageIcon, Loader2 } from "lucide-react";
import LocationPicker from "./LocationPicker";
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

interface Court {
    court_id: number;
    name: string;
    code: string;
    venue_id: number;
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
    // Thay đổi cách khởi tạo imagePreview
    const [imagePreview, setImagePreview] = useState(
        equipment?.image ? getImageUrl(equipment.image) : null
    );
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
    const [courtId, setCourtId] = useState<string>(
        equipment?.court_id?.toString() || "none"
    );
    const [locationDetail, setLocationDetail] = useState(
        equipment?.location_detail || ""
    );
    const [locationNotes, setLocationNotes] = useState("");
    const [visualLocation, setVisualLocation] = useState<string>("");

    // Initialize visual location from existing equipment
    useEffect(() => {
        if (equipment?.location_detail) {
            // Parse location notes from location_detail if it contains "Ghi chú:"
            const locationText = equipment.location_detail;
            const noteIndex = locationText.indexOf(" - Ghi chú: ");
            if (noteIndex !== -1) {
                const baseLocation = locationText.substring(0, noteIndex);
                const notes = locationText.substring(
                    noteIndex + " - Ghi chú: ".length
                );
                setLocationDetail(baseLocation);
                setLocationNotes(notes);

                // Try to find matching visual location ID
                // For numbered locations like "1", "2", "3" - convert to corresponding IDs
                const numberToId: Record<string, string> = {
                    "1": "one",
                    "2": "two",
                    "3": "three",
                    "4": "four",
                    "5": "five",
                    "6": "six",
                    "7": "seven",
                    "8": "eight",
                    "9": "nine",
                    "10": "ten",
                    "11": "eleven",
                    "12": "twelve",
                    "13": "thirteen",
                    "14": "fourteen",
                    "15": "fifteen",
                    "16": "sixteen",
                    "17": "seventeen",
                    "18": "eighteen",
                    "19": "nineteen",
                    "20": "twenty",
                    "21": "twentyone",
                    "22": "twentytwo",
                    "23": "twentythree",
                    "24": "twentyfour",
                    "25": "twentyfive",
                };

                if (numberToId[baseLocation]) {
                    setVisualLocation(numberToId[baseLocation]);
                }
            } else if (locationText.startsWith("Ghi chú: ")) {
                const notes = locationText.substring("Ghi chú: ".length);
                setLocationDetail("");
                setLocationNotes(notes);
            } else {
                // Simple location without notes
                setLocationDetail(locationText);

                // Try to find matching visual location ID
                const numberToId: Record<string, string> = {
                    "1": "one",
                    "2": "two",
                    "3": "three",
                    "4": "four",
                    "5": "five",
                    "6": "six",
                    "7": "seven",
                    "8": "eight",
                    "9": "nine",
                    "10": "ten",
                    "11": "eleven",
                    "12": "twelve",
                    "13": "thirteen",
                    "14": "fourteen",
                    "15": "fifteen",
                    "16": "sixteen",
                    "17": "seventeen",
                    "18": "eighteen",
                    "19": "nineteen",
                    "20": "twenty",
                    "21": "twentyone",
                    "22": "twentytwo",
                    "23": "twentythree",
                    "24": "twentyfour",
                    "25": "twentyfive",
                };

                if (numberToId[locationText]) {
                    setVisualLocation(numberToId[locationText]);
                }
            }
        }
    }, [equipment?.location_detail]);
    // const [serialNumber, setSerialNumber] = useState(
    //     equipment?.serial_number || ""
    // );
    // const [manufacturer, setManufacturer] = useState(
    //     equipment?.manufacturer || ""
    // );
    // const [model, setModel] = useState(equipment?.model || "");
    const [status, setStatus] = useState<
        "available" | "in_use" | "maintenance" | "unavailable"
    >(
        (equipment?.status as
            | "available"
            | "in_use"
            | "maintenance"
            | "unavailable") || "available"
    );
    const [purchaseDate, setPurchaseDate] = useState(
        equipment?.purchase_date || ""
    );
    const [purchasePrice, setPurchasePrice] = useState(
        equipment?.purchase_price?.toString() || ""
    );
    const [warrantyExpiry, setWarrantyExpiry] = useState(
        equipment?.warranty_expiry || ""
    );
    const [lastMaintenanceDate, setLastMaintenanceDate] = useState(
        equipment?.last_maintenance_date || ""
    );
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState(
        equipment?.next_maintenance_date || ""
    );
    // const [qrCode, setQrCode] = useState(equipment?.qr_code || "");
    // const [imagePreview, setImagePreview] = useState(equipment?.image || null);

    // Options
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingVenues, setIsLoadingVenues] = useState(false);
    const [isLoadingCourts, setIsLoadingCourts] = useState(false);

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

    // Fetch sân thi đấu theo địa điểm
    const fetchCourtsData = useCallback(
        async (venueId: string) => {
            if (!venueId || venueId === "none") {
                setCourts([]);
                setCourtId("none");
                return;
            }
            try {
                setIsLoadingCourts(true);
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi(`/courts/venue/${venueId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách sân");
                }

                const data = await response.json();
                setCourts(data);

                // Reset court selection when venue changes
                if (equipment?.venue_id?.toString() !== venueId) {
                    setCourtId("none");
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
                toast.error("Không thể tải danh sách sân");
            } finally {
                setIsLoadingCourts(false);
            }
        },
        [equipment?.venue_id]
    );

    // Fetch data khi component mount
    useEffect(() => {
        fetchCategoriesData();
        fetchVenuesData();
    }, [fetchCategoriesData, fetchVenuesData]);

    // Fetch courts when venue changes
    useEffect(() => {
        fetchCourtsData(venueId);
    }, [venueId, fetchCourtsData]);

    // Map court type names to visual picker types
    const getCourtTypeForPicker = () => {
        if (!courts.length) return "football";

        // Get court type from the selected court or first court
        const selectedCourt =
            courts.find((c) => c.court_id.toString() === courtId) || courts[0];
        if (!selectedCourt) return "football";

        // Ưu tiên kiểm tra mã sân cho cầu lông
        if (["CL-01", "CL-02", "CL-03", "CL-04"].includes(selectedCourt.code)) {
            return "badminton";
        }

        // Map based on court name to determine type
        const courtName = selectedCourt.name?.toLowerCase() || "";

        if (courtName.includes("bóng đá") || courtName.includes("football"))
            return "football";
        if (courtName.includes("bóng rổ") || courtName.includes("basketball"))
            return "basketball";
        if (courtName.includes("tennis")) return "tennis";
        if (
            courtName.includes("bóng chuyền") ||
            courtName.includes("volleyball")
        )
            return "volleyball";
        if (courtName.includes("cầu lông") || courtName.includes("badminton"))
            return "badminton";
        if (courtName.includes("pickleball") || courtName.includes("pickle"))
            return "pickleball";

        return "football";
    };

    // Handle visual location selection
    const handleVisualLocationSelect = (
        locationId: string,
        locationName: string
    ) => {
        setVisualLocation(locationId);
        setLocationDetail(locationName);
        // Không thực hiện hành động tự động nào khác
        // Chỉ cập nhật state, người dùng phải nhấn "Lưu thay đổi" để submit
    };

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

        // Kiểm tra ngày mua không được là trong tương lai
        if (purchaseDate) {
            const selectedDate = new Date(purchaseDate);
            const currentDate = new Date();

            // Loại bỏ giờ, phút, giây để chỉ so sánh ngày
            selectedDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            if (selectedDate > currentDate) {
                toast.error("Ngày mua không được là ngày trong tương lai");
                return;
            }
        }

        // Kiểm tra ngày bảo hành
        if (warrantyExpiry && purchaseDate) {
            const warrantyDate = new Date(warrantyExpiry);
            const purchaseDateObj = new Date(purchaseDate);

            if (warrantyDate < purchaseDateObj) {
                toast.error("Ngày hết hạn bảo hành phải sau ngày mua");
                return;
            }
        }

        // Kiểm tra ngày bảo trì
        if (nextMaintenanceDate && lastMaintenanceDate) {
            const nextDate = new Date(nextMaintenanceDate);
            const lastDate = new Date(lastMaintenanceDate);

            if (nextDate <= lastDate) {
                toast.error(
                    "Ngày bảo trì tiếp theo phải sau ngày bảo trì gần nhất"
                );
                return;
            }
        }

        if (!name || !code || !categoryId) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("code", code);
        formData.append("category_id", categoryId);
        formData.append("status", status);

        if (description) formData.append("description", description);
        if (purchaseDate) formData.append("purchase_date", purchaseDate);
        if (purchasePrice) formData.append("purchase_price", purchasePrice);
        if (venueId && venueId !== "none") formData.append("venue_id", venueId);
        if (courtId && courtId !== "none") formData.append("court_id", courtId);
        // Combine location detail with notes if notes exist
        let finalLocationDetail = locationDetail;
        if (locationNotes.trim()) {
            finalLocationDetail = locationDetail
                ? `${locationDetail} - Ghi chú: ${locationNotes.trim()}`
                : `Ghi chú: ${locationNotes.trim()}`;
        }
        if (finalLocationDetail)
            formData.append("location_detail", finalLocationDetail);
        // if (serialNumber) formData.append("serial_number", serialNumber);
        // if (manufacturer) formData.append("manufacturer", manufacturer);
        // if (model) formData.append("model", model);
        if (warrantyExpiry) formData.append("warranty_expiry", warrantyExpiry);
        if (lastMaintenanceDate)
            formData.append("last_maintenance_date", lastMaintenanceDate);
        if (nextMaintenanceDate)
            formData.append("next_maintenance_date", nextMaintenanceDate);
        // if (qrCode) formData.append("qr_code", qrCode);

        // Thêm file ảnh nếu có
        const imageInput = fileInputRef.current?.files?.[0];
        if (imageInput) {
            formData.append("image", imageInput);
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <Card>
                    <CardContent className="space-y-4">
                        {/* Layout 2 cột: Thông tin cơ bản bên trái, Hình ảnh bên phải */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Cột trái: Thông tin cơ bản */}
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="name"
                                        className="font-medium"
                                    >
                                        Tên thiết bị{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Nhập tên thiết bị"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="code"
                                        className="font-medium"
                                    >
                                        Mã thiết bị{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value)
                                        }
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
                            </div>

                            {/* Cột phải: Hình ảnh thiết bị */}
                            <div className="space-y-2">
                                <Label htmlFor="image" className="font-medium">
                                    Hình ảnh thiết bị
                                </Label>

                                <div className="flex items-center justify-center">
                                    <div className="border border-dashed border-gray-300 rounded-lg p-4 w-full text-center">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <div
                                                    className="mx-auto mb-2 max-h-[100px] rounded"
                                                    style={{
                                                        backgroundImage: `url(${imagePreview})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition:
                                                            "center",
                                                        width: "100%",
                                                        height: "100px",
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
                                            <div className="py-2 flex flex-col items-center justify-center text-gray-500">
                                                <ImageIcon className="h-10 w-12 mb-2" />
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
                        </div>

                        {/* Danh mục đã được chuyển vào phần Vị trí thiết bị */}

                        {/* Location Section */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">
                                Vị trí thiết bị
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Danh mục */}
                                <div className="space-y-2 flex gap-2 items-center">
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
                                {/* Địa điểm */}
                                <div className="space-y-2 flex items-center gap-2">
                                    <Label
                                        htmlFor="venue"
                                        className="font-medium"
                                    >
                                        Địa điểm
                                    </Label>
                                    <Select
                                        value={venueId}
                                        onValueChange={setVenueId}
                                        disabled={isLoadingVenues}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn địa điểm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Không chọn địa điểm
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
                                {/* Sân thi đấu */}
                                <div className="space-y-2 flex items-center gap-2">
                                    <Label
                                        htmlFor="court"
                                        className="font-medium"
                                    >
                                        Sân thi đấu
                                    </Label>
                                    <Select
                                        value={courtId}
                                        onValueChange={setCourtId}
                                        disabled={
                                            isLoadingCourts ||
                                            !venueId ||
                                            venueId === "none"
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn sân thi đấu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Không chọn sân
                                            </SelectItem>
                                            {courts.map((court) => (
                                                <SelectItem
                                                    key={court.court_id}
                                                    value={court.court_id.toString()}
                                                >
                                                    {court.name} ({court.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                {/* Disable LocationPicker if venue or court not selected */}
                                <LocationPicker
                                    selectedLocation={visualLocation}
                                    onLocationSelect={
                                        handleVisualLocationSelect
                                    }
                                    courtType={getCourtTypeForPicker()}
                                    className={
                                        "mt-2 " +
                                        (venueId === "none" ||
                                        !venueId ||
                                        courtId === "none" ||
                                        !courtId
                                            ? "pointer-events-none opacity-60"
                                            : "")
                                    }
                                    locationNote={locationNotes}
                                    onLocationNoteChange={setLocationNotes}
                                    courtCode={(() => {
                                        const selectedCourt = courts.find(
                                            (c) =>
                                                c.court_id.toString() ===
                                                courtId
                                        );
                                        return selectedCourt
                                            ? selectedCourt.code
                                            : undefined;
                                    })()}
                                />
                                {(venueId === "none" ||
                                    !venueId ||
                                    courtId === "none" ||
                                    !courtId) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded-lg select-none">
                                        <span className="text-gray-500 font-medium">
                                            Chọn địa điểm và sân thi đấu để chọn
                                            vị trí
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trạng thái, ngày mua, giá mua, ngày hết hạn bảo hành - 1 hàng ngang */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Trạng thái */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="font-medium">
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
                            {/* Ngày mua */}
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
                                        required
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
                            {/* Giá mua */}
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
                                    required
                                />
                            </div>
                            {/* Ngày hết hạn bảo hành */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="warrantyExpiry"
                                    className="font-medium"
                                >
                                    Ngày hết hạn bảo hành
                                </Label>
                                <Input
                                    id="warrantyExpiry"
                                    type="date"
                                    value={warrantyExpiry}
                                    onChange={(e) =>
                                        setWarrantyExpiry(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Maintenance Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                                Bảo trì thiết bị
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="lastMaintenanceDate"
                                        className="font-medium"
                                    >
                                        Ngày bảo trì gần nhất
                                    </Label>
                                    <Input
                                        id="lastMaintenanceDate"
                                        type="date"
                                        value={lastMaintenanceDate}
                                        onChange={(e) =>
                                            setLastMaintenanceDate(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="nextMaintenanceDate"
                                        className="font-medium"
                                    >
                                        Ngày bảo trì tiếp theo
                                    </Label>
                                    <Input
                                        id="nextMaintenanceDate"
                                        type="date"
                                        value={nextMaintenanceDate}
                                        onChange={(e) =>
                                            setNextMaintenanceDate(
                                                e.target.value
                                            )
                                        }
                                    />
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
