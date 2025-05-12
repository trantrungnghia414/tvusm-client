"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PlusCircle, Trash2, Edit, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { switch } from "@/components/ui/switch";
import { Arena, SubArena } from "../types/arenaTypes";
import ArenaImageUpload from "@/app/(admin)/dashboard/arenas/components/ArenaImageUpload";
// import ArenaImageUpload from "./ArenaImageUpload";

interface ArenaFormProps {
    arena?: Arena;
    isEditMode?: boolean;
}

export default function ArenaForm({
    arena,
    isEditMode = false,
}: ArenaFormProps) {
    // Main arena state
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<string>("football");
    const [status, setStatus] = useState<string>("active");
    const [pricePerHour, setPricePerHour] = useState<number>(0);
    const [openTime, setOpenTime] = useState("06:00");
    const [closeTime, setCloseTime] = useState("22:00");
    const [images, setImages] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);
    const [rules, setRules] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState("");
    const [newRule, setNewRule] = useState("");
    // Thêm state cho bộ lọc khoảng giá
    // const [priceRange, setPriceRange] = useState("all");

    // Sub-arenas state
    const [subArenas, setSubArenas] = useState<SubArena[]>([]);
    const [editingSubArena, setEditingSubArena] = useState<SubArena | null>(
        null
    );
    const [subArenaName, setSubArenaName] = useState("");
    const [subArenaType, setSubArenaType] = useState("");
    const [subArenaStatus, setSubArenaStatus] = useState("active");

    // Form state
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({
        name: "",
        address: "",
        pricePerHour: "",
        openTime: "",
        closeTime: "",
        images: "",
    });

    const router = useRouter();

    // Load data if in edit mode
    useEffect(() => {
        if (isEditMode && arena) {
            setName(arena.name);
            setAddress(arena.address);
            setDescription(arena.description);
            setType(arena.type);
            setStatus(arena.status);
            setPricePerHour(arena.price_per_hour);
            setOpenTime(arena.open_time);
            setCloseTime(arena.close_time);
            setImages(arena.images);
            setFeatures(arena.features || []);
            setRules(arena.rules || []);
            setSubArenas(arena.sub_arenas);
        }
    }, [arena, isEditMode]);

    // Validate form
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            name: "",
            address: "",
            pricePerHour: "",
            openTime: "",
            closeTime: "",
            images: "",
        };

        if (!name.trim()) {
            newErrors.name = "Tên sân không được để trống";
            isValid = false;
        }

        if (!address.trim()) {
            newErrors.address = "Địa chỉ không được để trống";
            isValid = false;
        }

        if (pricePerHour <= 0) {
            newErrors.pricePerHour = "Giá thuê phải lớn hơn 0";
            isValid = false;
        }

        if (!openTime) {
            newErrors.openTime = "Thời gian mở cửa không được để trống";
            isValid = false;
        }

        if (!closeTime) {
            newErrors.closeTime = "Thời gian đóng cửa không được để trống";
            isValid = false;
        }

        if (images.length === 0) {
            newErrors.images = "Cần có ít nhất 1 hình ảnh";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle image upload
    const handleImagesChange = (imageUrls: string[]) => {
        setImages(imageUrls);
        if (errors.images && imageUrls.length > 0) {
            setErrors({ ...errors, images: "" });
        }
    };

    // Add a new feature
    const addFeature = () => {
        if (newFeature.trim() && !features.includes(newFeature.trim())) {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature("");
        }
    };

    // Remove a feature
    const removeFeature = (featureToRemove: string) => {
        setFeatures(features.filter((feature) => feature !== featureToRemove));
    };

    // Add a new rule
    const addRule = () => {
        if (newRule.trim() && !rules.includes(newRule.trim())) {
            setRules([...rules, newRule.trim()]);
            setNewRule("");
        }
    };

    // Remove a rule
    const removeRule = (ruleToRemove: string) => {
        setRules(rules.filter((rule) => rule !== ruleToRemove));
    };

    // Add or update a sub-arena
    const saveSubArena = () => {
        if (!subArenaName.trim() || !subArenaType.trim()) {
            toast.error("Tên và loại sân con không được để trống");
            return;
        }

        if (editingSubArena) {
            // Update existing sub-arena
            setSubArenas(
                subArenas.map((sa) =>
                    sa.id === editingSubArena.id
                        ? {
                              ...sa,
                              name: subArenaName,
                              type: subArenaType,
                              status: subArenaStatus as
                                  | "active"
                                  | "maintenance"
                                  | "inactive",
                          }
                        : sa
                )
            );
            setEditingSubArena(null);
        } else {
            // Add new sub-arena
            const newId = Math.max(0, ...subArenas.map((sa) => sa.id)) + 1;
            setSubArenas([
                ...subArenas,
                {
                    id: newId,
                    name: subArenaName,
                    type: subArenaType,
                    status: subArenaStatus as
                        | "active"
                        | "maintenance"
                        | "inactive",
                },
            ]);
        }

        // Reset form fields
        setSubArenaName("");
        setSubArenaType("");
        setSubArenaStatus("active");
    };

    // Edit a sub-arena
    const editSubArena = (subArena: SubArena) => {
        setEditingSubArena(subArena);
        setSubArenaName(subArena.name);
        setSubArenaType(subArena.type);
        setSubArenaStatus(subArena.status);
    };

    // Delete a sub-arena
    const deleteSubArena = (id: number) => {
        setSubArenas(subArenas.filter((sa) => sa.id !== id));

        // If we're editing this sub-arena, cancel the edit
        if (editingSubArena && editingSubArena.id === id) {
            setEditingSubArena(null);
            setSubArenaName("");
            setSubArenaType("");
            setSubArenaStatus("active");
        }
    };

    // Cancel editing a sub-arena
    const cancelEditSubArena = () => {
        setEditingSubArena(null);
        setSubArenaName("");
        setSubArenaType("");
        setSubArenaStatus("active");
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const arenaData = {
                name,
                address,
                description,
                type,
                status,
                price_per_hour: pricePerHour,
                open_time: openTime,
                close_time: closeTime,
                images,
                features,
                rules,
                sub_arenas: subArenas,
            };

            // Log data for debugging
            console.log("Submitting arena data:", arenaData);

            // API endpoints
            // let url = "/arenas";
            // let method = "POST";

            if (isEditMode && arena) {
                // url = `/arenas/${arena.id}`;
                // method = "PUT";
            }

            // In reality, you would make an API request here
            // For demo purposes, we'll just simulate success

            // Simulate API call
            // const response = await fetchApi(url, {
            //   method,
            //   headers: {
            //     Authorization: `Bearer ${token}`,
            //     "Content-Type": "application/json"
            //   },
            //   body: JSON.stringify(arenaData)
            // });

            // if (!response.ok) {
            //   const errorData = await response.json();
            //   throw new Error(errorData.message || "Không thể lưu thông tin sân");
            // }

            // Simulate successful response
            toast.success(
                isEditMode
                    ? "Cập nhật sân thể thao thành công"
                    : "Thêm sân thể thao mới thành công"
            );

            router.push("/dashboard/arenas");
        } catch (error) {
            console.error("Error saving arena:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : isEditMode
                    ? "Không thể cập nhật sân thể thao"
                    : "Không thể thêm sân thể thao mới"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Tabs
                defaultValue="general"
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className="mb-4">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="sub-arenas">Sân con</TabsTrigger>
                    <TabsTrigger value="details">Chi tiết bổ sung</TabsTrigger>
                    <TabsTrigger value="images">Hình ảnh</TabsTrigger>
                </TabsList>

                {/* General Information Tab */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Tên sân{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Nhập tên sân thể thao"
                                        className={
                                            errors.name ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">
                                        Loại sân{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={type}
                                        onValueChange={setType}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Chọn loại sân" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="football">
                                                Sân bóng đá
                                            </SelectItem>
                                            <SelectItem value="volleyball">
                                                Sân bóng chuyền
                                            </SelectItem>
                                            <SelectItem value="basketball">
                                                Sân bóng rổ
                                            </SelectItem>
                                            <SelectItem value="badminton">
                                                Sân cầu lông
                                            </SelectItem>
                                            <SelectItem value="tennis">
                                                Sân tennis
                                            </SelectItem>
                                            <SelectItem value="swimming">
                                                Hồ bơi
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Khác
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">
                                        Địa chỉ{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        placeholder="Nhập địa chỉ sân thể thao"
                                        className={
                                            errors.address
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Nhập mô tả về sân thể thao"
                                        rows={4}
                                    />
                                </div>

                                {/* Price per hour */}
                                <div className="space-y-2">
                                    <Label htmlFor="price_per_hour">
                                        Giá thuê/giờ (VNĐ){" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="price_per_hour"
                                        type="number"
                                        value={pricePerHour || ""}
                                        onChange={(e) =>
                                            setPricePerHour(
                                                Number(e.target.value)
                                            )
                                        }
                                        placeholder="Nhập giá thuê mỗi giờ"
                                        min={0}
                                        className={
                                            errors.pricePerHour
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.pricePerHour && (
                                        <p className="text-sm text-red-500">
                                            {errors.pricePerHour}
                                        </p>
                                    )}
                                </div>

                                {/* Thay thế phần input giá hiện tại bằng Select dropdown */}
                                {/* <div className="space-y-2">
                                    <Label htmlFor="price_range">
                                        Khoảng giá
                                    </Label>
                                    <Select
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                    >
                                        <SelectTrigger id="price_range">
                                            <SelectValue placeholder="Chọn khoảng giá" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Tất cả giá
                                            </SelectItem>
                                            <SelectItem value="0-200000">
                                                Dưới 200.000đ
                                            </SelectItem>
                                            <SelectItem value="200000-400000">
                                                200.000đ - 400.000đ
                                            </SelectItem>
                                            <SelectItem value="400000-600000">
                                                400.000đ - 600.000đ
                                            </SelectItem>
                                            <SelectItem value="600000-800000">
                                                600.000đ - 800.000đ
                                            </SelectItem>
                                            <SelectItem value="800000-1000000">
                                                800.000đ - 1.000.000đ
                                            </SelectItem>
                                            <SelectItem value="1000000+">
                                                Trên 1.000.000đ
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div> */}

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Trạng thái{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Hoạt động
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Đang bảo trì
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Không hoạt động
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Open time */}
                                <div className="space-y-2">
                                    <Label htmlFor="open_time">
                                        Giờ mở cửa{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="open_time"
                                        type="time"
                                        value={openTime}
                                        onChange={(e) =>
                                            setOpenTime(e.target.value)
                                        }
                                        className={
                                            errors.openTime
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.openTime && (
                                        <p className="text-sm text-red-500">
                                            {errors.openTime}
                                        </p>
                                    )}
                                </div>

                                {/* Close time */}
                                <div className="space-y-2">
                                    <Label htmlFor="close_time">
                                        Giờ đóng cửa{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="close_time"
                                        type="time"
                                        value={closeTime}
                                        onChange={(e) =>
                                            setCloseTime(e.target.value)
                                        }
                                        className={
                                            errors.closeTime
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.closeTime && (
                                        <p className="text-sm text-red-500">
                                            {errors.closeTime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sub-Arenas Tab */}
                <TabsContent value="sub-arenas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quản lý sân con</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Sub-arena name */}
                                <div className="space-y-2">
                                    <Label htmlFor="sub_arena_name">
                                        Tên sân con
                                    </Label>
                                    <Input
                                        id="sub_arena_name"
                                        value={subArenaName}
                                        onChange={(e) =>
                                            setSubArenaName(e.target.value)
                                        }
                                        placeholder="Nhập tên sân con"
                                    />
                                </div>

                                {/* Sub-arena type */}
                                <div className="space-y-2">
                                    <Label htmlFor="sub_arena_type">
                                        Loại sân con
                                    </Label>
                                    <Input
                                        id="sub_arena_type"
                                        value={subArenaType}
                                        onChange={(e) =>
                                            setSubArenaType(e.target.value)
                                        }
                                        placeholder="Nhập loại sân con (VD: 5x5, 7x7)"
                                    />
                                </div>

                                {/* Sub-arena status */}
                                <div className="space-y-2">
                                    <Label htmlFor="sub_arena_status">
                                        Trạng thái
                                    </Label>
                                    <Select
                                        value={subArenaStatus}
                                        onValueChange={setSubArenaStatus}
                                    >
                                        <SelectTrigger id="sub_arena_status">
                                            <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Hoạt động
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                                Đang bảo trì
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Không hoạt động
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sub-arena actions */}
                                <div className="flex items-end space-x-2">
                                    <Button
                                        type="button"
                                        onClick={
                                            editingSubArena
                                                ? saveSubArena
                                                : saveSubArena
                                        }
                                        className="flex items-center"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {editingSubArena ? "Cập nhật" : "Thêm"}
                                    </Button>

                                    {editingSubArena && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={cancelEditSubArena}
                                        >
                                            Hủy
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Sub-arenas list */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    Danh sách sân con
                                </h3>
                                {subArenas.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>
                                                    Tên sân con
                                                </TableHead>
                                                <TableHead>Loại</TableHead>
                                                <TableHead>
                                                    Trạng thái
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Thao tác
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subArenas.map((subArena) => (
                                                <TableRow key={subArena.id}>
                                                    <TableCell>
                                                        {subArena.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subArena.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {subArena.type}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                subArena.status ===
                                                                "active"
                                                                    ? "default"
                                                                    : subArena.status ===
                                                                      "maintenance"
                                                                    ? "secondary"
                                                                    : "destructive"
                                                            }
                                                        >
                                                            {subArena.status ===
                                                            "active"
                                                                ? "Hoạt động"
                                                                : subArena.status ===
                                                                  "maintenance"
                                                                ? "Đang bảo trì"
                                                                : "Không hoạt động"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    editSubArena(
                                                                        subArena
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    deleteSubArena(
                                                                        subArena.id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-gray-500 italic">
                                        Chưa có sân con nào.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Additional Details Tab */}
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chi tiết bổ sung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Features */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">
                                    Tiện ích
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={newFeature}
                                        onChange={(e) =>
                                            setNewFeature(e.target.value)
                                        }
                                        placeholder="Thêm tiện ích mới (VD: Wifi miễn phí, Nhà vệ sinh)"
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addFeature();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={addFeature}
                                        className="flex items-center"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Thêm
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {features.map((feature, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            {feature}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFeature(feature)
                                                }
                                                className="ml-1 text-red-500 hover:text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </Badge>
                                    ))}
                                    {features.length === 0 && (
                                        <p className="text-gray-500 italic">
                                            Chưa có tiện ích nào.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Rules */}
                            <div className="space-y-4 mt-8">
                                <h3 className="text-lg font-semibold">
                                    Quy định
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={newRule}
                                        onChange={(e) =>
                                            setNewRule(e.target.value)
                                        }
                                        placeholder="Thêm quy định mới (VD: Không hút thuốc, Không mang đồ ăn vào sân)"
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addRule();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={addRule}
                                        className="flex items-center"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Thêm
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {rules.map((rule, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            {rule}
                                            <button
                                                type="button"
                                                onClick={() => removeRule(rule)}
                                                className="ml-1 text-red-500 hover:text-red-700"
                                            >
                                                &times;
                                            </button>
                                        </Badge>
                                    ))}
                                    {rules.length === 0 && (
                                        <p className="text-gray-500 italic">
                                            Chưa có quy định nào.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hình ảnh sân thể thao</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ArenaImageUpload
                                images={images}
                                onChange={handleImagesChange}
                                maxImages={10}
                            />
                            {errors.images && (
                                <p className="text-sm text-red-500 mt-2">
                                    {errors.images}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end mt-6 space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/arenas")}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving
                        ? "Đang lưu..."
                        : isEditMode
                        ? "Cập nhật"
                        : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
