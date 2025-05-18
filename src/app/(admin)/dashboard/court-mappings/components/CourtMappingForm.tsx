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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Court } from "../../courts/types/courtTypes";
import { Loader2 } from "lucide-react";
import { CourtMapping, CourtMappingFormData } from "../types";

interface CourtMappingFormProps {
    onSubmit: (data: CourtMappingFormData) => Promise<void>;
    existingMapping?: CourtMapping | null;
}

export default function CourtMappingForm({
    onSubmit,
    existingMapping,
}: CourtMappingFormProps) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [parentCourtId, setParentCourtId] = useState<string>("");
    const [childCourtId, setChildCourtId] = useState<string>("");
    const [position, setPosition] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

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

    useEffect(() => {
        if (existingMapping) {
            setParentCourtId(existingMapping.parent_court_id.toString());
            setChildCourtId(existingMapping.child_court_id.toString());
            setPosition(existingMapping.position || "");
        }
    }, [existingMapping]);

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

        setSaving(true);

        try {
            const mappingData: CourtMappingFormData = {
                parent_court_id: parseInt(parentCourtId),
                child_court_id: parseInt(childCourtId),
                position: position || null,
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
                                    {court.name} ({court.code})
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
                            {courts.map((court) => (
                                <SelectItem
                                    key={court.court_id}
                                    value={court.court_id.toString()}
                                    disabled={
                                        court.court_id.toString() ===
                                        parentCourtId
                                    }
                                >
                                    {court.name} ({court.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position">Vị trí trong sân lớn</Label>
                    <Input
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Nhập vị trí (ví dụ: trái, phải, giữa)"
                        disabled={saving}
                    />
                    <p className="text-xs text-gray-500">
                        Vị trí của sân con trong sân cha (ví dụ: trái, phải,
                        giữa)
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/court-mappings")}
                    disabled={saving}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={saving || loading}>
                    {saving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {existingMapping ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
}
