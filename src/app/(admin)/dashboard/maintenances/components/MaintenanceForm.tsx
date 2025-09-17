// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceForm.tsx
"use client";

import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
    CalendarIcon,
    Save,
    ArrowLeft,
    Loader2,
    Building,
    User,
    DollarSign,
    Clock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    CreateMaintenanceDto,
    UpdateMaintenanceDto,
    Maintenance,
    VenueOption,
    CourtOption,
    EquipmentOption,
    UserOption,
} from "../types/maintenance";
import { fetchApi } from "@/lib/api";
import MaintenanceTypeBadge from "./MaintenanceTypeBadge";
import MaintenancePriorityBadge from "./MaintenancePriorityBadge";

interface MaintenanceFormProps {
    maintenance?: Maintenance;
    isEdit?: boolean;
    onSave: (
        data: CreateMaintenanceDto | UpdateMaintenanceDto
    ) => Promise<void>;
    onCancel: () => void;
}

export default function MaintenanceForm({
    maintenance,
    isEdit = false,
    onSave,
    onCancel,
}: MaintenanceFormProps) {
    // const router = useRouter();

    // Form states
    const [formData, setFormData] = useState<CreateMaintenanceDto>({
        title: maintenance?.title || "",
        description: maintenance?.description || "",
        type: maintenance?.type || "routine",
        priority: maintenance?.priority || "medium",
        venue_id: maintenance?.venue_id,
        court_id: maintenance?.court_id,
        equipment_id: maintenance?.equipment_id,
        assigned_to: maintenance?.assigned_to,
        estimated_cost: maintenance?.estimated_cost,
        estimated_duration: maintenance?.estimated_duration,
        scheduled_date:
            maintenance?.scheduled_date ||
            new Date().toISOString().split("T")[0],
        notes: maintenance?.notes || "",
    });

    // Dropdown data
    const [venues, setVenues] = useState<VenueOption[]>([]);
    const [courts, setCourts] = useState<CourtOption[]>([]);
    const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<CourtOption[]>([]);
    const [filteredEquipment, setFilteredEquipment] = useState<
        EquipmentOption[]
    >([]);

    // UI states
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const [venuesRes, courtsRes, equipmentRes, usersRes] =
                    await Promise.all([
                        fetchApi("/venues", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        fetchApi("/courts", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        fetchApi("/equipment", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                        fetchApi("/users", {
                            headers: { Authorization: `Bearer ${token}` },
                        }),
                    ]);

                if (venuesRes.ok) {
                    const venuesData = await venuesRes.json();
                    setVenues(venuesData);
                }

                if (courtsRes.ok) {
                    const courtsData = await courtsRes.json();
                    setCourts(courtsData);
                }

                if (equipmentRes.ok) {
                    const equipmentData = await equipmentRes.json();
                    setEquipment(equipmentData);
                }

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(
                        // ✅ Fix: Thay thế any bằng UserOption với type assertion
                        usersData.filter((user: UserOption) =>
                            ["admin", "staff", "technician"].includes(user.role)
                        )
                    );
                }
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                toast.error("Không thể tải dữ liệu dropdown");
            } finally {
                setLoading(false);
            }
        };

        fetchDropdownData();
    }, []);

    // Filter courts and equipment based on selected venue
    useEffect(() => {
        if (formData.venue_id) {
            setFilteredCourts(
                courts.filter((court) => court.venue_id === formData.venue_id)
            );
            setFilteredEquipment(
                equipment.filter((eq) => eq.venue_id === formData.venue_id)
            );
        } else {
            setFilteredCourts(courts);
            setFilteredEquipment(equipment);
        }

        // Reset court and equipment if venue changed
        if (maintenance?.venue_id !== formData.venue_id) {
            setFormData((prev) => ({
                ...prev,
                court_id: undefined,
                equipment_id: undefined,
            }));
        }
    }, [formData.venue_id, courts, equipment, maintenance?.venue_id]);

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Tiêu đề là bắt buộc";
        }

        if (!formData.scheduled_date) {
            newErrors.scheduled_date = "Ngày lên lịch là bắt buộc";
        }

        if (formData.estimated_cost && formData.estimated_cost < 0) {
            newErrors.estimated_cost = "Chi phí phải lớn hơn 0";
        }

        if (formData.estimated_duration && formData.estimated_duration <= 0) {
            newErrors.estimated_duration = "Thời gian ước tính phải lớn hơn 0";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error("Error saving maintenance:", error);
        } finally {
            setSaving(false);
        }
    };

    // ✅ Fix: Tạo type union cho các field value types
    type FormFieldValue = string | number | undefined;

    // Handle input changes
    const handleInputChange = (
        field: keyof CreateMaintenanceDto,
        value: FormFieldValue
    ) => {
        let processedValue = value;

        // Convert ID fields from string to number, handle "none" as undefined
        if (
            ["venue_id", "court_id", "equipment_id", "assigned_to"].includes(
                field
            )
        ) {
            if (value === "none" || value === "") {
                processedValue = undefined;
            } else if (typeof value === "string") {
                processedValue = parseInt(value, 10);
            }
        }

        setFormData((prev) => ({
            ...prev,
            [field]: processedValue,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            handleInputChange(
                "scheduled_date",
                date.toISOString().split("T")[0]
            );
            setCalendarOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Title */}
                            <div>
                                <Label htmlFor="title">
                                    Tiêu đề{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "title",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập tiêu đề bảo trì..."
                                    className={
                                        errors.title ? "border-red-500" : ""
                                    }
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <Label htmlFor="description">
                                    Mô tả chi tiết
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Mô tả chi tiết về công việc bảo trì..."
                                    rows={4}
                                />
                            </div>

                            {/* Type and Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Loại bảo trì</Label>
                                    <Select
                                        value={formData.type}
                                        // ✅ Fix: Thay thế any bằng Maintenance["type"]
                                        onValueChange={(
                                            value: Maintenance["type"]
                                        ) => handleInputChange("type", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="preventive">
                                                <div className="flex items-center gap-2">
                                                    <MaintenanceTypeBadge
                                                        type="preventive"
                                                        size="sm"
                                                    />
                                                    Dự phòng
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="corrective">
                                                <div className="flex items-center gap-2">
                                                    <MaintenanceTypeBadge
                                                        type="corrective"
                                                        size="sm"
                                                    />
                                                    Sửa chữa
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="emergency">
                                                <div className="flex items-center gap-2">
                                                    <MaintenanceTypeBadge
                                                        type="emergency"
                                                        size="sm"
                                                    />
                                                    Khẩn cấp
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="routine">
                                                <div className="flex items-center gap-2">
                                                    <MaintenanceTypeBadge
                                                        type="routine"
                                                        size="sm"
                                                    />
                                                    Định kỳ
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Mức độ ưu tiên</Label>
                                    <Select
                                        value={formData.priority}
                                        // ✅ Fix: Thay thế any bằng Maintenance["priority"]
                                        onValueChange={(
                                            value: Maintenance["priority"]
                                        ) =>
                                            handleInputChange("priority", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                <div className="flex items-center gap-2">
                                                    <MaintenancePriorityBadge
                                                        priority="low"
                                                        size="sm"
                                                    />
                                                    Thấp
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center gap-2">
                                                    <MaintenancePriorityBadge
                                                        priority="medium"
                                                        size="sm"
                                                    />
                                                    Trung bình
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center gap-2">
                                                    <MaintenancePriorityBadge
                                                        priority="high"
                                                        size="sm"
                                                    />
                                                    Cao
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="critical">
                                                <div className="flex items-center gap-2">
                                                    <MaintenancePriorityBadge
                                                        priority="critical"
                                                        size="sm"
                                                    />
                                                    Khẩn cấp
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location & Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Vị trí và thiết bị
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Venue */}
                            <div>
                                <Label>Địa điểm</Label>
                                <Select
                                    value={
                                        formData.venue_id?.toString() || "none"
                                    }
                                    onValueChange={(value) =>
                                        handleInputChange("venue_id", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn địa điểm" />
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
                                                {venue.name} - {venue.location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Court and Equipment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Sân thể thao</Label>
                                    <Select
                                        value={
                                            formData.court_id?.toString() ||
                                            "none"
                                        }
                                        onValueChange={(value) =>
                                            handleInputChange("court_id", value)
                                        }
                                        disabled={!formData.venue_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn sân" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Không chọn
                                            </SelectItem>
                                            {filteredCourts.map((court) => (
                                                <SelectItem
                                                    key={court.court_id}
                                                    value={court.court_id.toString()}
                                                >
                                                    {court.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Thiết bị</Label>
                                    <Select
                                        value={
                                            formData.equipment_id?.toString() ||
                                            "none"
                                        }
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                "equipment_id",
                                                value
                                            )
                                        }
                                        disabled={!formData.venue_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn thiết bị" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Không chọn
                                            </SelectItem>
                                            {filteredEquipment.map((eq) => (
                                                <SelectItem
                                                    key={eq.equipment_id}
                                                    value={eq.equipment_id.toString()}
                                                >
                                                    {eq.name} ({eq.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ghi chú</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) =>
                                    handleInputChange("notes", e.target.value)
                                }
                                placeholder="Ghi chú thêm về công việc bảo trì..."
                                rows={3}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Schedule & Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Lịch trình & phân công
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Scheduled Date */}
                            <div>
                                <Label>
                                    Ngày lên lịch{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Popover
                                    open={calendarOpen}
                                    onOpenChange={setCalendarOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${
                                                errors.scheduled_date
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.scheduled_date ? (
                                                format(
                                                    new Date(
                                                        formData.scheduled_date
                                                    ),
                                                    "dd/MM/yyyy",
                                                    {
                                                        locale: vi,
                                                    }
                                                )
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={
                                                formData.scheduled_date
                                                    ? new Date(
                                                          formData.scheduled_date
                                                      )
                                                    : undefined
                                            }
                                            onSelect={handleDateSelect}
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.scheduled_date && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.scheduled_date}
                                    </p>
                                )}
                            </div>

                            {/* Assigned User */}
                            <div>
                                <Label>Người phụ trách</Label>
                                <Select
                                    value={
                                        formData.assigned_to?.toString() ||
                                        "none"
                                    }
                                    onValueChange={(value) =>
                                        handleInputChange("assigned_to", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người phụ trách" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Chưa phân công
                                        </SelectItem>
                                        {users.map((user) => (
                                            <SelectItem
                                                key={user.user_id}
                                                value={user.user_id.toString()}
                                            >
                                                <div className="flex flex-col">
                                                    <span>
                                                        {user.fullname ||
                                                            user.username}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {user.email} •{" "}
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost & Duration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Chi phí & thời gian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Estimated Cost */}
                            <div>
                                <Label>Chi phí ước tính (VNĐ)</Label>
                                <Input
                                    type="number"
                                    value={formData.estimated_cost || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "estimated_cost",
                                            e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined
                                        )
                                    }
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    className={
                                        errors.estimated_cost
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.estimated_cost && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.estimated_cost}
                                    </p>
                                )}
                            </div>

                            {/* Estimated Duration */}
                            <div>
                                <Label className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Thời gian ước tính (giờ)
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.estimated_duration || ""}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "estimated_duration",
                                            e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined
                                        )
                                    }
                                    placeholder="0"
                                    min="0"
                                    step="0.5"
                                    className={
                                        errors.estimated_duration
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.estimated_duration && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.estimated_duration}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isEdit ? "Cập nhật" : "Tạo mới"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={onCancel}
                                    disabled={saving}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Hủy bỏ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
