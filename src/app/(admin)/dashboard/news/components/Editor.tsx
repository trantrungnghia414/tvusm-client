"use client";

import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon,
    RotateCcw,
    RotateCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function Editor({
    value,
    onChange,
    placeholder = "Bắt đầu nhập nội dung...",
}: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-500 underline",
                },
            }),
            Image.configure({
                allowBase64: true,
                inline: true,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
                alignments: ["left", "center", "right", "justify"],
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Các hàm xử lý chức năng soạn thảo
    const addImage = useCallback(() => {
        const url = window.prompt("URL hình ảnh");

        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL liên kết", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-md overflow-hidden">
            {/* Thanh công cụ soạn thảo */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
                {/* Định dạng văn bản */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("bold")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor.chain().focus().toggleBold().run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <Bold className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>In đậm (Ctrl+B)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("italic")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor.chain().focus().toggleItalic().run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <Italic className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>In nghiêng (Ctrl+I)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("underline")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleUnderline()
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <UnderlineIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Gạch dưới (Ctrl+U)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Danh sách và trích dẫn */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("bulletList")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBulletList()
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Danh sách</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("orderedList")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleOrderedList()
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <ListOrdered className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Danh sách có thứ tự</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("blockquote")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .toggleBlockquote()
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <Quote className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Trích dẫn</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Căn chỉnh văn bản */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive({ textAlign: "left" })
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign("left")
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Căn trái</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive({ textAlign: "center" })
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign("center")
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Căn giữa</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive({ textAlign: "right" })
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign("right")
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <AlignRight className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Căn phải</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive({ textAlign: "justify" })
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .setTextAlign("justify")
                                        .run()
                                }
                                className="h-8 w-8 p-0"
                            >
                                <AlignJustify className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Căn đều</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Liên kết và hình ảnh */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={
                                    editor.isActive("link")
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={setLink}
                                className="h-8 w-8 p-0"
                            >
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Thêm liên kết</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={addImage}
                                className="h-8 w-8 p-0"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Thêm hình ảnh</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Undo và Redo */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    editor.chain().focus().undo().run()
                                }
                                disabled={!editor.can().undo()}
                                className="h-8 w-8 p-0"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hoàn tác (Ctrl+Z)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    editor.chain().focus().redo().run()
                                }
                                disabled={!editor.can().redo()}
                                className="h-8 w-8 p-0"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Làm lại (Ctrl+Y)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Nội dung soạn thảo */}
            <EditorContent
                editor={editor}
                className="prose prose-sm sm:prose max-w-none p-4 min-h-[300px] focus:outline-none"
            />
        </div>
    );
}
