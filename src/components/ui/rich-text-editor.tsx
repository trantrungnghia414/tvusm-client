"use client";

import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Định nghĩa kiểu dữ liệu cho CKEditor
type CKEditorInstance = {
    getData: () => string;
};

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    editorClassName?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Nhập nội dung...",
    disabled = false,
    editorClassName = "",
}: RichTextEditorProps) {
    const [editorLoaded, setEditorLoaded] = useState(false);

    // Khắc phục hydration mismatch
    useEffect(() => {
        setEditorLoaded(true);
    }, []);

    // Cấu hình nâng cao cho CKEditor
    const editorConfig = {
        placeholder: placeholder,
        toolbar: {
            items: [
                "heading",
                "|",
                "fontFamily",
                "fontSize",
                "fontColor",
                "fontBackgroundColor",
                "|",
                "bold",
                "italic",
                "underline",
                "strikethrough",
                "|",
                "alignment:left",
                "alignment:center",
                "alignment:right",
                "alignment:justify",
                "|",
                "bulletedList",
                "numberedList",
                "|",
                "indent",
                "outdent",
                "|",
                "link",
                "imageUpload",
                "blockQuote",
                "insertTable",
                "|",
                "undo",
                "redo",
            ],
            shouldNotGroupWhenFull: true,
        },
        image: {
            toolbar: [
                "imageStyle:inline",
                "imageStyle:block",
                "imageStyle:side",
                "|",
                "imageTextAlternative",
            ],
        },
        table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
        },
    };

    return (
        <div className={`rich-text-editor ${editorClassName}`}>
            {editorLoaded ? (
                <CKEditor
                    editor={ClassicEditor}
                    config={editorConfig}
                    data={value}
                    disabled={disabled}
                    onReady={() => {
                        // Nếu cần thiết, bạn có thể lưu editor instance vào useRef
                    }}
                    onChange={(
                        _event: unknown,
                        editorInstance: CKEditorInstance
                    ) => {
                        const data = editorInstance.getData();
                        onChange(data);
                    }}
                />
            ) : (
                <div className="p-4 border rounded-md bg-gray-50 text-gray-500 flex items-center justify-center">
                    Đang tải trình soạn thảo...
                </div>
            )}
        </div>
    );
}
