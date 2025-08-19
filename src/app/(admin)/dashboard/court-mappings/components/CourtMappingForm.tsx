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

// Định nghĩa các vị trí cố định (sẽ không sử dụng nữa)
// const POSITIONS = [
//     { value: "Trái", label: "Trái" },
//     { value: "Giữa", label: "Giữa" },
//     { value: "Phải", label: "Phải" },
// ];

// ✅ Hàm tạo vị trí động dựa vào số lượng sân con của sân cha
const generatePositions = (subCourtCount: number) => {
    const positions = [];
    for (let i = 1; i <= subCourtCount; i++) {
        positions.push({
            value: i.toString(),
            label: `Vị trí ${i}`,
        });
    }
    return positions;
};

// ✅ Định nghĩa các cấp độ sân
const COURT_LEVELS = {
    SMALL: 1, // Sân nhỏ
    MEDIUM: 2, // Sân vừa
    LARGE: 3, // Sân lớn
};

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
    const [position, setPosition] = useState<string>("Trái");
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

                    // ✅ Debug: Log dữ liệu để kiểm tra
                    console.log("📊 All courts data:", data);
                    console.log(
                        "📊 Courts with court_level:",
                        data.filter((court: Court) => court.court_level)
                    );

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

                    const parentMappings = mappings.filter(
                        (mapping: CourtMapping) =>
                            mapping.parent_court_id.toString() ===
                                parentCourtId &&
                            (!existingMapping ||
                                mapping.mapping_id !==
                                    existingMapping.mapping_id)
                    );

                    const positions = parentMappings
                        .map((mapping: CourtMapping) => mapping.position)
                        .filter(Boolean);

                    setUsedPositions(positions);
                }
            } catch (error) {
                console.error("Error fetching court mappings:", error);
            }
        };

        fetchUsedPositions();
    }, [parentCourtId, existingMapping]);

    // Set giá trị ban đầu khi chỉnh sửa
    useEffect(() => {
        if (!formInitialized && courts.length > 0 && existingMapping) {
            setParentCourtId(existingMapping.parent_court_id.toString());
            setChildCourtId(existingMapping.child_court_id.toString());
            setPosition(existingMapping.position || "Trái");
            setFormInitialized(true);
        }
    }, [courts, existingMapping, formInitialized]);

    // Reset form khi existingMapping thay đổi
    useEffect(() => {
        if (!existingMapping || (existingMapping && formInitialized)) {
            setParentCourtId(existingMapping?.parent_court_id.toString() || "");
            setChildCourtId(existingMapping?.child_court_id.toString() || "");
            setPosition(existingMapping?.position || "Trái");
            setFormInitialized(!!existingMapping);
        }
    }, [existingMapping, formInitialized]);

    // ✅ Lọc sân cha: chỉ hiển thị sân cấp 2 và 3
    const parentCourts = courts.filter((court) => {
        const courtLevel = court.court_level;
        // Chấp nhận cả number và string, convert về number để so sánh
        const level =
            typeof courtLevel === "string"
                ? parseInt(courtLevel, 10)
                : courtLevel;

        return (
            level && [COURT_LEVELS.MEDIUM, COURT_LEVELS.LARGE].includes(level)
        );
    });

    // ✅ Lọc sân con dựa theo các tiêu chí mới
    const getChildCourts = () => {
        if (!parentCourtId) return [];

        const selectedParentCourt = courts.find(
            (court) => court.court_id.toString() === parentCourtId
        );

        if (!selectedParentCourt || !selectedParentCourt.court_level) return [];

        const parentLevel =
            typeof selectedParentCourt.court_level === "string"
                ? parseInt(selectedParentCourt.court_level, 10)
                : selectedParentCourt.court_level;

        return courts.filter((court) => {
            const childLevel =
                typeof court.court_level === "string"
                    ? parseInt(court.court_level, 10)
                    : court.court_level;

            // 1. Sân con cấp phải nhỏ hơn sân cha
            if (!childLevel || childLevel >= parentLevel) {
                return false;
            }

            // 2. Sân con phải cùng nhà thi đấu với sân cha
            if (court.venue_id !== selectedParentCourt.venue_id) {
                return false;
            }

            // 3. Sân con phải cùng loại (trong nhà/ngoài trời) với sân cha
            if (court.is_indoor !== selectedParentCourt.is_indoor) {
                return false;
            }

            // 4. Không được chọn chính sân cha
            if (court.court_id.toString() === parentCourtId) {
                return false;
            }

            return true;
        });
    };

    const childCourts = getChildCourts();

    // ✅ Reset sân con khi sân cha thay đổi
    useEffect(() => {
        if (parentCourtId && !existingMapping) {
            setChildCourtId("");
        }
    }, [parentCourtId, existingMapping]);

    // ✅ Tạo danh sách vị trí có thể chọn dựa vào sân cha
    const getAvailablePositions = () => {
        if (!parentCourtId) {
            return [];
        }

        const selectedParentCourt = courts.find(
            (court) => court.court_id.toString() === parentCourtId
        );

        if (!selectedParentCourt?.sub_court_count) {
            return [];
        }

        // Tạo tất cả vị trí có thể dựa vào sub_court_count
        const allPositions = generatePositions(
            selectedParentCourt.sub_court_count
        );

        // Lọc ra những vị trí đã được sử dụng
        return allPositions.filter(
            (pos: { value: string; label: string }) =>
                !usedPositions.includes(pos.value)
        );
    };

    const availablePositions = getAvailablePositions();

    // Tự động chọn vị trí đầu tiên có sẵn nếu vị trí hiện tại đã bị sử dụng
    useEffect(() => {
        if (
            parentCourtId &&
            usedPositions.includes(position) &&
            availablePositions.length > 0
        ) {
            if (existingMapping && existingMapping.position === position) {
                return;
            }
            setPosition(availablePositions[0].value);
        }
    }, [
        parentCourtId,
        usedPositions,
        position,
        availablePositions,
        existingMapping,
    ]);

    // ✅ Hàm helper để lấy tên cấp độ sân
    const getCourtLevelName = (level: number | string): string => {
        const numLevel =
            typeof level === "string" ? parseInt(level, 10) : level;

        switch (numLevel) {
            case COURT_LEVELS.SMALL:
                return "Cấp 1 (Nhỏ)";
            case COURT_LEVELS.MEDIUM:
                return "Cấp 2 (Vừa)";
            case COURT_LEVELS.LARGE:
                return "Cấp 3 (Lớn)";
            default:
                return "Không xác định";
        }
    };

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

        // ✅ Kiểm tra cấp độ sân cha và sân con
        const parentCourt = courts.find(
            (court) => court.court_id.toString() === parentCourtId
        );
        const childCourt = courts.find(
            (court) => court.court_id.toString() === childCourtId
        );

        if (!parentCourt || !childCourt) {
            toast.error("Không tìm thấy thông tin sân");
            return;
        }

        const parentLevel =
            typeof parentCourt.court_level === "string"
                ? parseInt(parentCourt.court_level, 10)
                : parentCourt.court_level;
        const childLevel =
            typeof childCourt.court_level === "string"
                ? parseInt(childCourt.court_level, 10)
                : childCourt.court_level;

        // Kiểm tra logic cấp độ
        if (
            parentLevel === COURT_LEVELS.MEDIUM &&
            childLevel !== COURT_LEVELS.SMALL
        ) {
            toast.error("Sân cha cấp vừa chỉ có thể ghép với sân con cấp nhỏ");
            return;
        }

        if (
            parentLevel === COURT_LEVELS.LARGE &&
            ![COURT_LEVELS.SMALL, COURT_LEVELS.MEDIUM].includes(childLevel!)
        ) {
            toast.error(
                "Sân cha cấp lớn chỉ có thể ghép với sân con cấp nhỏ hoặc cấp vừa"
            );
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
                        Sân cha (cấp vừa/lớn){" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={parentCourtId}
                        onValueChange={setParentCourtId}
                        disabled={loading || saving}
                    >
                        <SelectTrigger id="parentCourt">
                            <SelectValue placeholder="Chọn sân cha (cấp 2 hoặc 3)" />
                        </SelectTrigger>
                        <SelectContent>
                            {parentCourts.map((court) => (
                                <SelectItem
                                    key={court.court_id}
                                    value={court.court_id.toString()}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {court.name} ({court.code})
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {getCourtLevelName(
                                                court.court_level!
                                            )}{" "}
                                            •{" "}
                                            {court.type_name ||
                                                "Không xác định"}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* ✅ Hiển thị thông tin debug */}
                    {!loading && (
                        <div className="text-xs text-gray-500">
                            <p>📊 Tổng số sân: {courts.length}</p>
                            <p>
                                🎯 Sân cấp 2 & 3 khả dụng: {parentCourts.length}
                            </p>
                        </div>
                    )}

                    {parentCourts.length === 0 && !loading && (
                        <p className="text-xs text-red-500">
                            Không có sân cấp vừa (2) hoặc lớn (3) nào khả dụng
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="childCourt">
                        Sân con <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={childCourtId}
                        onValueChange={setChildCourtId}
                        disabled={loading || saving || !parentCourtId}
                    >
                        <SelectTrigger id="childCourt">
                            <SelectValue
                                placeholder={
                                    !parentCourtId
                                        ? "Vui lòng chọn sân cha trước"
                                        : childCourts.length === 0
                                        ? "Không có sân con phù hợp"
                                        : "Chọn sân con"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {childCourts.map((court) => (
                                <SelectItem
                                    key={court.court_id}
                                    value={court.court_id.toString()}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {court.name} ({court.code})
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {getCourtLevelName(
                                                court.court_level!
                                            )}{" "}
                                            •{" "}
                                            {court.type_name ||
                                                "Không xác định"}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {parentCourtId && (
                        <p className="text-xs text-muted-foreground">
                            {(() => {
                                const selectedParent = courts.find(
                                    (c) =>
                                        c.court_id.toString() === parentCourtId
                                );
                                if (!selectedParent) return "";

                                const parentLevel =
                                    typeof selectedParent.court_level ===
                                    "string"
                                        ? parseInt(
                                              selectedParent.court_level,
                                              10
                                          )
                                        : selectedParent.court_level;

                                if (parentLevel === COURT_LEVELS.MEDIUM) {
                                    return "Sân cha cấp vừa → Chỉ có thể chọn sân con cấp nhỏ";
                                } else if (parentLevel === COURT_LEVELS.LARGE) {
                                    return "Sân cha cấp lớn → Có thể chọn sân con cấp vừa hoặc nhỏ";
                                }
                                return "";
                            })()}
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
                            <SelectValue
                                placeholder={
                                    !parentCourtId
                                        ? "Vui lòng chọn sân cha trước"
                                        : !availablePositions.length &&
                                          !existingMapping
                                        ? "Sân cha đã hết vị trí"
                                        : "Chọn vị trí"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {existingMapping && existingMapping.position ? (
                                <SelectItem
                                    key={existingMapping.position}
                                    value={existingMapping.position}
                                >
                                    {`Vị trí ${existingMapping.position}`}
                                </SelectItem>
                            ) : null}

                            {availablePositions
                                .filter(
                                    (pos: { value: string; label: string }) =>
                                        !existingMapping ||
                                        pos.value !== existingMapping.position
                                )
                                .map(
                                    (pos: { value: string; label: string }) => (
                                        <SelectItem
                                            key={pos.value}
                                            value={pos.value}
                                        >
                                            {pos.label}
                                        </SelectItem>
                                    )
                                )}
                        </SelectContent>
                    </Select>
                    {usedPositions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Vị trí đã sử dụng: {usedPositions.join(", ")}
                        </p>
                    )}
                    {parentCourtId &&
                        !availablePositions.length &&
                        !existingMapping && (
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
                        !parentCourtId ||
                        !childCourtId ||
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
