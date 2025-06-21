// client/src/app/(admin)/dashboard/rentals/components/RentalForm.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CalendarIcon,
    Package,
    User,
    DollarSign,
    Save,
    X,
    Plus,
    Minus,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CreateRentalDto, Equipment, User as UserType } from "../types/rental";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

// ✅ Thêm interface cho dữ liệu thô từ API
interface RawEquipmentData {
    equipment_id: number;
    name: string;
    code: string;
    category_name?: string;
    rental_fee: number;
    available_quantity: number;
    status: string;
    image?: string;
    category?: {
        name: string;
    };
}

interface RawUserData {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    name?: string;
    phone?: string;
}

interface RentalFormProps {
    onSubmit: (data: CreateRentalDto) => void;
    submitting?: boolean;
    initialData?: Partial<CreateRentalDto>;
}

export default function RentalForm({
    onSubmit,
    submitting = false,
    initialData,
}: RentalFormProps) {
    // Form states
    const [formData, setFormData] = useState<CreateRentalDto>({
        user_id: initialData?.user_id,
        equipment_id: initialData?.equipment_id || 0,
        quantity: initialData?.quantity || 1,
        start_date: initialData?.start_date || "",
        end_date: initialData?.end_date || "",
        total_amount: initialData?.total_amount,
        notes: initialData?.notes || "",
        customer_name: initialData?.customer_name || "",
        customer_phone: initialData?.customer_phone || "",
        customer_email: initialData?.customer_email || "",
    });

    // Data states
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedEquipment, setSelectedEquipment] =
        useState<Equipment | null>(null);

    // Date states
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialData?.start_date ? new Date(initialData.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialData?.end_date ? new Date(initialData.end_date) : undefined
    );

    // UI states
    const [loading, setLoading] = useState(true);
    const [customerType, setCustomerType] = useState<"registered" | "guest">(
        "registered"
    );

    // Fetch equipments and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const [equipmentsResponse, usersResponse] = await Promise.all([
                    fetchApi("/equipment", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/users", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (equipmentsResponse.ok) {
                    const equipmentsData: RawEquipmentData[] =
                        await equipmentsResponse.json();
                    const availableEquipments = equipmentsData
                        .filter(
                            (eq: RawEquipmentData) =>
                                eq.status === "available" &&
                                eq.available_quantity > 0 &&
                                eq.rental_fee > 0
                        )
                        .map((equipment: RawEquipmentData) => ({
                            equipment_id: equipment.equipment_id,
                            name: equipment.name,
                            code: equipment.code,
                            category_name:
                                equipment.category_name ||
                                equipment.category?.name ||
                                "",
                            rental_fee: equipment.rental_fee,
                            available_quantity: equipment.available_quantity,
                            status: equipment.status as Equipment["status"],
                            image: equipment.image,
                        }));
                    setEquipments(availableEquipments);

                    // Set selected equipment if provided
                    if (initialData?.equipment_id) {
                        const equipment = availableEquipments.find(
                            (eq: Equipment) =>
                                eq.equipment_id === initialData.equipment_id
                        );
                        setSelectedEquipment(equipment || null);
                    }
                }

                if (usersResponse.ok) {
                    const usersData: RawUserData[] = await usersResponse.json();
                    setUsers(
                        usersData.map((user: RawUserData) => ({
                            user_id: user.user_id,
                            username: user.username,
                            email: user.email,
                            fullname: user.fullname || user.name,
                            phone: user.phone,
                        }))
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialData]);

    // Calculate total amount when equipment, quantity, or dates change
    useEffect(() => {
        if (
            selectedEquipment &&
            formData.quantity > 0 &&
            startDate &&
            endDate
        ) {
            const days = Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
            );
            if (days > 0) {
                const totalAmount =
                    selectedEquipment.rental_fee * formData.quantity * days;
                setFormData((prev) => ({ ...prev, total_amount: totalAmount }));
            }
        }
    }, [selectedEquipment, formData.quantity, startDate, endDate]);

    const handleEquipmentChange = (equipmentId: string) => {
        const equipment = equipments.find(
            (eq) => eq.equipment_id.toString() === equipmentId
        );
        setSelectedEquipment(equipment || null);
        setFormData((prev) => ({
            ...prev,
            equipment_id: parseInt(equipmentId),
            quantity: 1, // Reset quantity when changing equipment
        }));
    };

    const handleStartDateSelect = (date: Date | undefined) => {
        setStartDate(date);
        setStartDateOpen(false);
        if (date) {
            setFormData((prev) => ({
                ...prev,
                start_date: format(date, "yyyy-MM-dd"),
            }));
            // Auto set end date to next day if not set
            if (!endDate) {
                const nextDay = addDays(date, 1);
                setEndDate(nextDay);
                setFormData((prev) => ({
                    ...prev,
                    end_date: format(nextDay, "yyyy-MM-dd"),
                }));
            }
        }
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        setEndDate(date);
        setEndDateOpen(false);
        if (date) {
            setFormData((prev) => ({
                ...prev,
                end_date: format(date, "yyyy-MM-dd"),
            }));
        }
    };

    const handleQuantityChange = (increment: boolean) => {
        if (!selectedEquipment) return;

        const newQuantity = increment
            ? formData.quantity + 1
            : Math.max(1, formData.quantity - 1);

        if (newQuantity <= selectedEquipment.available_quantity) {
            setFormData((prev) => ({ ...prev, quantity: newQuantity }));
        } else {
            toast.error(
                `Chỉ có ${selectedEquipment.available_quantity} thiết bị khả dụng`
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.equipment_id || !startDate || !endDate) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        if (customerType === "registered" && !formData.user_id) {
            toast.error("Vui lòng chọn khách hàng");
            return;
        }

        if (
            customerType === "guest" &&
            (!formData.customer_name || !formData.customer_phone)
        ) {
            toast.error("Vui lòng điền tên và số điện thoại khách hàng");
            return;
        }

        if (startDate >= endDate) {
            toast.error("Ngày kết thúc phải sau ngày bắt đầu");
            return;
        }

        if (!selectedEquipment) {
            toast.error("Vui lòng chọn thiết bị");
            return;
        }

        if (formData.quantity > selectedEquipment.available_quantity) {
            toast.error("Số lượng thuê vượt quá số lượng khả dụng");
            return;
        }

        onSubmit(formData);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const calculateDays = () => {
        if (startDate && endDate) {
            return Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
            );
        }
        return 0;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Thông tin khách hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Loại khách hàng</Label>
                        <Select
                            value={customerType}
                            onValueChange={(value: "registered" | "guest") =>
                                setCustomerType(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="registered">
                                    Khách hàng đã đăng ký
                                </SelectItem>
                                <SelectItem value="guest">
                                    Khách vãng lai
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {customerType === "registered" ? (
                        <div>
                            <Label htmlFor="user_id">Chọn khách hàng *</Label>
                            <Select
                                value={formData.user_id?.toString() || ""}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        user_id: parseInt(value),
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khách hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.user_id}
                                            value={user.user_id.toString()}
                                        >
                                            {user.fullname || user.username} (
                                            {user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="customer_name">
                                    Tên khách hàng *
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={formData.customer_name || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập tên khách hàng"
                                />
                            </div>
                            <div>
                                <Label htmlFor="customer_phone">
                                    Số điện thoại *
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={formData.customer_phone || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_phone: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div>
                                <Label htmlFor="customer_email">Email</Label>
                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={formData.customer_email || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_email: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập email"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Equipment Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Chọn thiết bị
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="equipment_id">Thiết bị *</Label>
                        <Select
                            value={formData.equipment_id.toString()}
                            onValueChange={handleEquipmentChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn thiết bị" />
                            </SelectTrigger>
                            <SelectContent>
                                {equipments.map((equipment) => (
                                    <SelectItem
                                        key={equipment.equipment_id}
                                        value={equipment.equipment_id.toString()}
                                    >
                                        {equipment.name} ({equipment.code}) -{" "}
                                        {formatCurrency(equipment.rental_fee)}
                                        /ngày - Còn{" "}
                                        {equipment.available_quantity}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedEquipment && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">
                                Thông tin thiết bị đã chọn
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600">
                                        Tên thiết bị:
                                    </span>{" "}
                                    {selectedEquipment.name}
                                </div>
                                <div>
                                    <span className="text-blue-600">
                                        Mã thiết bị:
                                    </span>{" "}
                                    {selectedEquipment.code}
                                </div>
                                <div>
                                    <span className="text-blue-600">
                                        Danh mục:
                                    </span>{" "}
                                    {selectedEquipment.category_name}
                                </div>
                                <div>
                                    <span className="text-blue-600">
                                        Giá thuê:
                                    </span>{" "}
                                    {formatCurrency(
                                        selectedEquipment.rental_fee
                                    )}
                                    /ngày
                                </div>
                                <div>
                                    <span className="text-blue-600">
                                        Số lượng khả dụng:
                                    </span>{" "}
                                    {selectedEquipment.available_quantity}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity Selection */}
                    {selectedEquipment && (
                        <div>
                            <Label>Số lượng thuê *</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(false)}
                                    disabled={formData.quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => {
                                        const quantity = parseInt(
                                            e.target.value
                                        );
                                        if (
                                            quantity > 0 &&
                                            quantity <=
                                                selectedEquipment.available_quantity
                                        ) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                quantity,
                                            }));
                                        }
                                    }}
                                    min={1}
                                    max={selectedEquipment.available_quantity}
                                    className="w-20 text-center"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleQuantityChange(true)}
                                    disabled={
                                        formData.quantity >=
                                        selectedEquipment.available_quantity
                                    }
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-500">
                                    / {selectedEquipment.available_quantity} khả
                                    dụng
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Date Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Thời gian thuê
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Ngày bắt đầu *</Label>
                            <Popover
                                open={startDateOpen}
                                onOpenChange={setStartDateOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? (
                                            format(startDate, "dd/MM/yyyy", {
                                                locale: vi,
                                            })
                                        ) : (
                                            <span>Chọn ngày bắt đầu</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={handleStartDateSelect}
                                        disabled={(date) => {
                                            // ✅ Sửa lỗi TypeScript bằng cách return boolean
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            if (date < today) return true;
                                            if (endDate && date >= endDate)
                                                return true;
                                            return false;
                                        }}
                                        initialFocus
                                        locale={vi}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div>
                            <Label>Ngày kết thúc *</Label>
                            <Popover
                                open={endDateOpen}
                                onOpenChange={setEndDateOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? (
                                            format(endDate, "dd/MM/yyyy", {
                                                locale: vi,
                                            })
                                        ) : (
                                            <span>Chọn ngày kết thúc</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={handleEndDateSelect}
                                        disabled={(date) => {
                                            // ✅ Sửa lỗi TypeScript bằng cách return boolean
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            if (startDate && date <= startDate)
                                                return true;
                                            if (!startDate && date < today)
                                                return true;
                                            return false;
                                        }}
                                        initialFocus
                                        locale={vi}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {startDate && endDate && (
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Thời gian thuê:</strong>{" "}
                                {calculateDays()} ngày
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cost Calculation */}
            {formData.total_amount && formData.total_amount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Chi phí thuê
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-green-50 p-4 rounded-lg space-y-2">
                            {selectedEquipment && (
                                <div className="text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Giá thuê / ngày:</span>
                                        <span>
                                            {formatCurrency(
                                                selectedEquipment.rental_fee
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Số lượng:</span>
                                        <span>{formData.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Số ngày:</span>
                                        <span>{calculateDays()}</span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-medium border-t pt-2">
                                <span>Tổng tiền:</span>
                                <span className="text-green-600">
                                    {formatCurrency(formData.total_amount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={formData.notes || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                notes: e.target.value,
                            }))
                        }
                        placeholder="Ghi chú thêm cho đơn thuê thiết bị..."
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                    {submitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Tạo đơn thuê
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={submitting}
                >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                </Button>
            </div>
        </form>
    );
}
