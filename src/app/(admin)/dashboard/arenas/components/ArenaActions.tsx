import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ArenaActionsProps {
    onAddNew: () => void;
    onExport?: () => void;
    onImport?: () => void;
}

export default function ArenaActions({
    onAddNew,
    onExport,
    // onImport,
}: ArenaActionsProps) {
    return (
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        <FileDown className="mr-1.5 h-4 w-4" />
                        Xuất
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={onExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Xuất Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Xuất PDF
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="default" size="sm" onClick={onAddNew}>
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Thêm sân mới
            </Button>
        </div>
    );
}
