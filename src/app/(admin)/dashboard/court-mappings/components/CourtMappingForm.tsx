import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Court } from "../../courts/types/courtTypes";
import { Loader2 } from "lucide-react";
import { CourtMapping, CourtMappingFormData } from "../types";

// Định nghĩa các vị trí cố định
const POSITIONS = [
    { value: "Trái", label: "Trái" },
    { value: "Giữa", label: "Giữa" },
    { value: "Phải", label: "Phải" },
];

interface CourtMappingFormProps {
    onSubmit: (data: CourtMappingFormData) => Promise<void>;
    existingMapping?: CourtMapping | null;
    onCancel: () => void;
}

export default function CourtMappingForm({
    onSubmit,
    existingMapping,
    onCancel,
}: CourtMappingFormProps) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [parentCourtId, setParentCourtId] = useState<string>("");
    const [childCourtId, setChildCourtId] = useState<string>("");
    const [position, setPosition] = useState<string>("Trái"); // Đặt mặc định là "trái"
    const [saving, setSaving] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [formInitialized, setFormInitialized] = useState<boolean>(false);
    const [usedPositions, setUsedPositions] = useState<string[]>([]);

    const router = useRouter();

    // Fetch danh sách sân
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi("/courts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCourts(data);
                } else {
                    throw new Error("Không thể tải danh sách sân");
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
                toast.error("Không thể tải danh sách sân");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [router]);

    // Lấy danh sách vị trí đã được sử dụng khi sân cha thay đổi
    useEffect(() => {
        const fetchUsedPositions = async () => {
            if (!parentCourtId) {
                setUsedPositions([]);
                return;
            }

            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/court-mappings", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const mappings = await response.json();

                    // Lọc ra các mappings liên quan đến sân cha đã chọn
                    const parentMappings = mappings.filter(
                        (mapping: CourtMapping) =>
                            mapping.parent_court_id.toString() ===
                                parentCourtId &&
                            // Nếu đang sửa, loại trừ mapping hiện tại
                            (!existingMapping ||
                                mapping.mapping_id !==
                                    existingMapping.mapping_id)
                    );

                    // Lấy các vị trí đã được sử dụng
                    const positions = parentMappings
                        .map((mapping: CourtMapping) => mapping.position)
                        .filter(Boolean); // Loại bỏ các giá trị null hoặc undefined

                    setUsedPositions(positions);
                }
            } catch (error) {
                console.error("Error fetching court mappings:", error);
            }
        };

        fetchUsedPositions();
    }, [parentCourtId, existingMapping]);

    // Set giá trị ban đầu khi chỉnh sửa - Chỉ khởi tạo form một lần khi cả courts và existingMapping có giá trị
    useEffect(() => {
        if (!formInitialized && courts.length > 0 && existingMapping) {
            setParentCourtId(existingMapping.parent_court_id.toString());
            setChildCourtId(existingMapping.child_court_id.toString());
            setPosition(existingMapping.position || "Trái"); // Nếu không có vị trí, mặc định là "trái"
            setFormInitialized(true);
        }
    }, [courts, existingMapping, formInitialized]);

    // Reset form khi existingMapping thay đổi
    useEffect(() => {
        // Nếu không có dữ liệu mapping (thêm mới) hoặc chuyển sang mapping khác, reset form
        if (!existingMapping || (existingMapping && formInitialized)) {
            setParentCourtId(existingMapping?.parent_court_id.toString() || "");
            setChildCourtId(existingMapping?.child_court_id.toString() || "");
            setPosition(existingMapping?.position || "Trái"); // Nếu không có vị trí, mặc định là "trái"
            setFormInitialized(!!existingMapping);
        }
    }, [existingMapping, formInitialized]);

    // Lọc ra các vị trí còn khả dụng
    const availablePositions = POSITIONS.filter(
        (pos) => !usedPositions.includes(pos.value)
    );

    // Tự động chọn vị trí đầu tiên có sẵn nếu vị trí hiện tại đã bị sử dụng
    useEffect(() => {
        if (
            parentCourtId &&
            usedPositions.includes(position) &&
            availablePositions.length > 0
        ) {
            // Nếu đang sửa, giữ nguyên vị trí
            if (existingMapping && existingMapping.position === position) {
                return;
            }

            // Nếu không, tự động chọn vị trí đầu tiên còn trống
            setPosition(availablePositions[0].value);
        }
    }, [
        parentCourtId,
        usedPositions,
        position,
        availablePositions,
        existingMapping,
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!parentCourtId) {
            toast.error("Vui lòng chọn sân cha");
            return;
        }

        if (!childCourtId) {
            toast.error("Vui lòng chọn sân con");
            return;
        }

        if (parentCourtId === childCourtId) {
            toast.error("Sân cha và sân con không thể là cùng một sân");
            return;
        }

        // Kiểm tra loại sân của sân cha và sân con
        const parentCourt = courts.find(
            (court) => court.court_id.toString() === parentCourtId
        );
        const childCourt = courts.find(
            (court) => court.court_id.toString() === childCourtId
        );

        if (
            parentCourt &&
            childCourt &&
            parentCourt.type_id === childCourt.type_id
        ) {
            toast.error("Sân cha và sân con không thể có cùng loại sân");
            return;
        }

        // Kiểm tra vị trí đã được sử dụng chưa
        if (usedPositions.includes(position)) {
            toast.error(`Vị trí ${position} đã được sử dụng trong sân cha này`);
            return;
        }

        setSaving(true);

        try {
            const mappingData: CourtMappingFormData = {
                parent_court_id: parseInt(parentCourtId),
                child_court_id: parseInt(childCourtId),
                position: position,
            };

            await onSubmit(mappingData);
        } catch (error) {
            console.error("Error submitting court mapping:", error);
            toast.error("Có lỗi xảy ra khi lưu thông tin");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="parentCourt">
                        Sân cha (sân lớn){" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={parentCourtId}
                        onValueChange={setParentCourtId}
                        disabled={loading || saving}
                    >
                        <SelectTrigger id="parentCourt">
                            <SelectValue placeholder="Chọn sân cha" />
                        </SelectTrigger>
                        <SelectContent>
                            {courts.map((court) => (
                                <SelectItem
                                    key={court.court_id}
                                    value={court.court_id.toString()}
                                    disabled={
                                        court.court_id.toString() ===
                                        childCourtId
                                    }
                                >
                                    {court.name} ({court.code}) -{" "}
                                    {court.type_name || "Không xác định"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="childCourt">
                        Sân con (sân nhỏ){" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={childCourtId}
                        onValueChange={setChildCourtId}
                        disabled={loading || saving}
                    >
                        <SelectTrigger id="childCourt">
                            <SelectValue placeholder="Chọn sân con" />
                        </SelectTrigger>
                        <SelectContent>
                            {courts.map((court) => {
                                // Lấy loại sân của sân cha đã chọn
                                const parentCourt = parentCourtId
                                    ? courts.find(
                                          (c) =>
                                              c.court_id.toString() ===
                                              parentCourtId
                                      )
                                    : null;

                                // Kiểm tra nếu là cùng ID hoặc cùng loại sân thì disable
                                const isSameId =
                                    court.court_id.toString() === parentCourtId;
                                const isSameType =
                                    parentCourt &&
                                    court.type_id === parentCourt.type_id;

                                return (
                                    <SelectItem
                                        key={court.court_id}
                                        value={court.court_id.toString()}
                                        disabled={!!(isSameId || isSameType)}
                                    >
                                        {court.name} ({court.code}) -{" "}
                                        {court.type_name || "Không xác định"}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    {childCourtId && parentCourtId && (
                        <p className="text-xs text-muted-foreground">
                            Sân con phải khác loại với sân cha để đảm bảo ghép
                            sân hợp lý
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position">
                        Vị trí trong sân lớn{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={position}
                        onValueChange={setPosition}
                        disabled={
                            saving ||
                            (!availablePositions.length && !existingMapping)
                        }
                    >
                        <SelectTrigger id="position">
                            <SelectValue placeholder="Chọn vị trí" />
                        </SelectTrigger>
                        <SelectContent>
                            {existingMapping && existingMapping.position ? (
                                // Nếu đang sửa, luôn hiển thị vị trí hiện tại
                                <SelectItem
                                    key={existingMapping.position}
                                    value={existingMapping.position}
                                >
                                    {POSITIONS.find(
                                        (p) =>
                                            p.value === existingMapping.position
                                    )?.label || existingMapping.position}
                                </SelectItem>
                            ) : null}

                            {/* Hiển thị các vị trí còn trống mà khác với vị trí hiện tại của existingMapping */}
                            {availablePositions
                                .filter(
                                    (pos) =>
                                        !existingMapping ||
                                        pos.value !== existingMapping.position
                                )
                                .map((pos) => (
                                    <SelectItem
                                        key={pos.value}
                                        value={pos.value}
                                    >
                                        {pos.label}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {usedPositions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Vị trí đã sử dụng: {usedPositions.join(", ")}
                        </p>
                    )}
                    {!availablePositions.length && !existingMapping && (
                        <p className="text-xs text-red-500">
                            Sân cha này đã sử dụng hết các vị trí có sẵn
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={saving}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    disabled={
                        saving ||
                        loading ||
                        (!availablePositions.length && !existingMapping)
                    }
                >
                    {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {existingMapping ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
