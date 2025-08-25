"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import LocationPicker from "../components/LocationPicker";
import { Loader2, Wrench } from "lucide-react";

interface Equipment {
    equipment_id: number;
    name: string;
    code: string;
    status: "available" | "in_use" | "maintenance" | "unavailable";
    category_id: number;
    venue_id?: number | null;
    court_id?: number | null;
    court_code?: string | null;
    location_detail?: string | null;
}

interface EquipmentCategory {
    category_id: number;
    name: string;
}

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

export default function EquipmentReportPage() {
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedVenue, setSelectedVenue] = useState<string>("all");
    const [selectedCourt, setSelectedCourt] = useState<string>("all");
    const [search, setSearch] = useState("");

    const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [selectedLocationId, setSelectedLocationId] = useState<string>("");
    const [selectedLocationName, setSelectedLocationName] =
        useState<string>("");
    const [locationNote, setLocationNote] = useState<string>("");
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<
        number | null
    >(null);

    // Issue fields
    const [issueType, setIssueType] = useState<
        "broken" | "malfunction" | "maintenance_needed" | "missing" | "damaged"
    >("broken");
    const [severity, setSeverity] = useState<
        "low" | "medium" | "high" | "critical"
    >("medium");
    const [issueTitle, setIssueTitle] = useState("");
    const [issueDescription, setIssueDescription] = useState("");

    // Fetch categories, venues
    const bootstrap = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const [catRes, venueRes, equipRes] = await Promise.all([
                fetchApi("/equipment/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi("/equipment", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (!catRes.ok || !venueRes.ok || !equipRes.ok) {
                throw new Error("Không thể tải dữ liệu bộ lọc hoặc thiết bị");
            }

            const [catJson, venueJson, equipJson] = await Promise.all([
                catRes.json(),
                venueRes.json(),
                equipRes.json(),
            ]);

            setCategories(catJson);
            setVenues(venueJson);
            setAllEquipments(equipJson);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải dữ liệu ban đầu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    // Load courts when venue changes
    useEffect(() => {
        const loadCourts = async () => {
            if (selectedVenue === "all") {
                setCourts([]);
                setSelectedCourt("all");
                return;
            }
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await fetchApi(`/courts/venue/${selectedVenue}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Không thể tải danh sách sân");
                const data = await res.json();
                setCourts(data);
                setSelectedCourt("all");
            } catch (e) {
                console.error(e);
                toast.error("Không thể tải danh sách sân");
            }
        };
        loadCourts();
    }, [selectedVenue]);

    const filteredEquipments = useMemo(() => {
        let list = [...allEquipments];
        if (selectedCategory !== "all") {
            list = list.filter(
                (e) => e.category_id?.toString() === selectedCategory
            );
        }
        if (selectedVenue !== "all") {
            list = list.filter(
                (e) => (e.venue_id ?? "").toString() === selectedVenue
            );
        }
        if (selectedCourt !== "all") {
            list = list.filter(
                (e) => (e.court_id ?? "").toString() === selectedCourt
            );
        }
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(
                (e) =>
                    e.name.toLowerCase().includes(s) ||
                    e.code.toLowerCase().includes(s)
            );
        }
        return list;
    }, [allEquipments, selectedCategory, selectedVenue, selectedCourt, search]);

    const selectedCourtCode = useMemo(() => {
        const court = courts.find(
            (c) => c.court_id.toString() === selectedCourt
        );
        return court?.code || undefined;
    }, [courts, selectedCourt]);

    // Tự động chọn thiết bị theo vị trí sau khi đã lọc
    useEffect(() => {
        if (!selectedLocationName) return;
        const getBaseLocation = (detail?: string | null) =>
            (detail || "").split(" - ")[0].trim();
        const matched = filteredEquipments.find(
            (e) => getBaseLocation(e.location_detail) === selectedLocationName
        );
        if (matched) {
            setSelectedEquipmentId(matched.equipment_id);
        } else {
            setSelectedEquipmentId(null);
            toast.error(
                "Không tìm thấy thiết bị tại vị trí đã chọn trong bộ lọc hiện tại"
            );
        }
    }, [selectedLocationName, filteredEquipments]);

    const selectedEquipment = useMemo(() => {
        if (!selectedEquipmentId) return null;
        return (
            filteredEquipments.find(
                (e) => e.equipment_id === selectedEquipmentId
            ) || null
        );
    }, [filteredEquipments, selectedEquipmentId]);

    const handleSubmitReport = async () => {
        if (!selectedEquipmentId) {
            toast.error("Vui lòng chọn thiết bị cần báo hỏng");
            return;
        }
        if (!issueTitle.trim() || !issueDescription.trim()) {
            toast.error("Vui lòng nhập tiêu đề và mô tả sự cố");
            return;
        }
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Phiên đăng nhập hết hạn");

            // 1) Tạo bản ghi report vào equipment_issues
            const createRes = await fetchApi(`/equipment-issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    equipment_id: selectedEquipmentId,
                    issue_type: issueType,
                    severity,
                    title: issueTitle.trim(),
                    description: issueDescription.trim(),
                    location_when_found: selectedLocationName
                        ? locationNote
                            ? `${selectedLocationName} - Ghi chú: ${locationNote.trim()}`
                            : selectedLocationName
                        : undefined,
                }),
            });
            if (!createRes.ok) {
                const err = await createRes.json().catch(() => ({}));
                throw new Error(err.message || "Không thể lưu báo cáo sự cố");
            }

            // 2) Tuỳ chọn: cập nhật thiết bị sang maintenance
            const patchRes = await fetchApi(
                `/equipment/${selectedEquipmentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: "maintenance" }),
                }
            );
            if (!patchRes.ok) {
                const err = await patchRes.json().catch(() => ({}));
                throw new Error(
                    err.message || "Không thể cập nhật trạng thái thiết bị"
                );
            }

            toast.success("Đã lưu báo cáo và chuyển trạng thái bảo trì");
            // refresh list
            setAllEquipments((prev) =>
                prev.map((e) =>
                    e.equipment_id === selectedEquipmentId
                        ? { ...e, status: "maintenance" }
                        : e
                )
            );
            // reset form fields (giữ lại bộ lọc)
            setIssueTitle("");
            setIssueDescription("");
            setSeverity("medium");
            setIssueType("broken");
        } catch (e) {
            console.error(e);
            toast.error(
                e instanceof Error ? e.message : "Không thể gửi báo cáo"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeTab="equipments">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Báo cáo thiết bị hư hỏng
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Bộ lọc</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Danh mục</Label>
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem
                                            key={c.category_id}
                                            value={c.category_id.toString()}
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nhà thi đấu</Label>
                            <Select
                                value={selectedVenue}
                                onValueChange={setSelectedVenue}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhà thi đấu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {venues.map((v) => (
                                        <SelectItem
                                            key={v.venue_id}
                                            value={v.venue_id.toString()}
                                        >
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sân thi đấu</Label>
                            <Select
                                value={selectedCourt}
                                onValueChange={setSelectedCourt}
                                disabled={selectedVenue === "all"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn sân" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {courts.map((c) => (
                                        <SelectItem
                                            key={c.court_id}
                                            value={c.court_id.toString()}
                                        >
                                            {c.name} ({c.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tìm kiếm</Label>
                            <Input
                                placeholder="Tên hoặc mã thiết bị"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn vị trí hư hỏng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <LocationPicker
                                selectedLocation={selectedLocationId}
                                onLocationSelect={(id, name) => {
                                    setSelectedLocationId(id);
                                    setSelectedLocationName(name);
                                }}
                                courtType={(() => {
                                    // rough mapping following EquipmentForm approach
                                    const court =
                                        courts.find(
                                            (c) =>
                                                c.court_id.toString() ===
                                                selectedCourt
                                        ) || undefined;
                                    if (!court) return "football";
                                    if (
                                        [
                                            "CL-01",
                                            "CL-02",
                                            "CL-03",
                                            "CL-04",
                                        ].includes(court.code)
                                    )
                                        return "badminton";
                                    const name = (
                                        court.name || ""
                                    ).toLowerCase();
                                    if (
                                        name.includes("bóng rổ") ||
                                        name.includes("basketball")
                                    )
                                        return "basketball";
                                    if (
                                        name.includes("bóng chuyền") ||
                                        name.includes("volleyball")
                                    )
                                        return "volleyball";
                                    if (name.includes("tennis"))
                                        return "tennis";
                                    if (
                                        name.includes("cầu lông") ||
                                        name.includes("badminton")
                                    )
                                        return "badminton";
                                    return "football";
                                })()}
                                courtCode={selectedCourtCode}
                                locationNote={locationNote}
                                onLocationNoteChange={setLocationNote}
                            />

                            {/* Issue fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Loại sự cố</Label>
                                    <Select
                                        value={issueType}
                                        onValueChange={(v) =>
                                            setIssueType(v as typeof issueType)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại sự cố" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="broken">
                                                Hư hỏng
                                            </SelectItem>
                                            <SelectItem value="malfunction">
                                                Lỗi hoạt động
                                            </SelectItem>
                                            <SelectItem value="maintenance_needed">
                                                Cần bảo trì
                                            </SelectItem>
                                            <SelectItem value="missing">
                                                Thất lạc
                                            </SelectItem>
                                            <SelectItem value="damaged">
                                                Bị hư hại
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mức độ</Label>
                                    <Select
                                        value={severity}
                                        onValueChange={(v) =>
                                            setSeverity(v as typeof severity)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn mức độ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                Thấp
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                Trung bình
                                            </SelectItem>
                                            <SelectItem value="high">
                                                Cao
                                            </SelectItem>
                                            <SelectItem value="critical">
                                                Nghiêm trọng
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Tiêu đề</Label>
                                    <Input
                                        placeholder="Nhập tiêu đề sự cố"
                                        value={issueTitle}
                                        onChange={(e) =>
                                            setIssueTitle(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Mô tả</Label>
                                    <textarea
                                        className="w-full border rounded p-2 min-h-[80px]"
                                        placeholder="Mô tả chi tiết sự cố"
                                        value={issueDescription}
                                        onChange={(e) =>
                                            setIssueDescription(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedEquipmentId(null);
                                        setSelectedLocationId("");
                                        setSelectedLocationName("");
                                        setLocationNote("");
                                        setIssueTitle("");
                                        setIssueDescription("");
                                        setSeverity("medium");
                                        setIssueType("broken");
                                    }}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    onClick={handleSubmitReport}
                                    disabled={
                                        submitting || !selectedEquipmentId
                                    }
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Wrench className="mr-2 h-4 w-4" />
                                            Báo hỏng & chuyển bảo trì
                                        </>
                                    )}
                                </Button>
                            </div>
                            {selectedEquipment && (
                                <div className="text-sm text-muted-foreground">
                                    Thiết bị được xác định:{" "}
                                    <span className="font-medium text-foreground">
                                        {selectedEquipment.name}
                                    </span>{" "}
                                    ({selectedEquipment.code})
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách thiết bị</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[360px] overflow-auto border rounded">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left">
                                                Chọn
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Tên
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Mã
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Trạng thái
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td className="p-4" colSpan={4}>
                                                    Đang tải...
                                                </td>
                                            </tr>
                                        ) : filteredEquipments.length === 0 ? (
                                            <tr>
                                                <td className="p-4" colSpan={4}>
                                                    Không có thiết bị phù hợp
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEquipments.map((eq) => (
                                                <tr
                                                    key={eq.equipment_id}
                                                    className="border-t hover:bg-muted/40"
                                                >
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="radio"
                                                            name="selectedEquipment"
                                                            checked={
                                                                selectedEquipmentId ===
                                                                eq.equipment_id
                                                            }
                                                            onChange={() =>
                                                                setSelectedEquipmentId(
                                                                    eq.equipment_id
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {eq.name}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono">
                                                        {eq.code}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span className="inline-flex items-center gap-2">
                                                            <span
                                                                className="h-2 w-2 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        eq.status ===
                                                                        "available"
                                                                            ? "#10b981"
                                                                            : eq.status ===
                                                                              "in_use"
                                                                            ? "#3b82f6"
                                                                            : eq.status ===
                                                                              "maintenance"
                                                                            ? "#f59e0b"
                                                                            : "#ef4444",
                                                                }}
                                                            />
                                                            {eq.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
