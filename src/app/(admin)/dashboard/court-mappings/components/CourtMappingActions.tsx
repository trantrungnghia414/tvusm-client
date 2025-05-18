import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourtMappingActionsProps {
    onAddMapping: () => void;
}

export default function CourtMappingActions({
    onAddMapping,
}: CourtMappingActionsProps) {
    return (
        <div className="flex gap-2">
            <Button onClick={onAddMapping}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm ghép sân mới
            </Button>
        </div>
    );
}
