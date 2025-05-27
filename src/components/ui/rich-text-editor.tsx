"use client";

import { useState, useEffect } from "react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";

// Định nghĩa kiểu dữ liệu cho editor và event
type Editor = {
    getData: () => string;
};

// Định nghĩa kiểu dữ liệu cho event từ CKEditor
type CKEditorEvent = {
    name: string;
    path: Array<string>;
    source: string;
    // Thêm các thuộc tính khác nếu cần
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

    useEffect(() => {
        setEditorLoaded(true);
    }, []);

    return (
        <div className={`rich-text-editor ${editorClassName}`}>
            {editorLoaded ? (
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        placeholder: placeholder,
                        toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "indent",
                            "outdent",
                            "|",
                            "imageUpload",
                            "blockQuote",
                            "insertTable",
                            "mediaEmbed",
                            "undo",
                            "redo",
                        ],
                    }}
                    data={value}
                    onReady={() => {
                        // Không cần tham số editor nếu không sử dụng
                    }}
                    onChange={(_event: CKEditorEvent, editor: Editor) => {
                        const data = editor.getData();
                        onChange(data);
                    }}
                    disabled={disabled}
                />
            ) : (
                <div className="p-4 border rounded-md bg-gray-50 text-gray-500 flex items-center justify-center">
                    Đang tải trình soạn thảo...
                </div>
            )}
        </div>
    );
}
