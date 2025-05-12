"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ArenaImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ArenaImageUpload({
    images,
    onChange,
    maxImages = 10,
}: ArenaImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        uploadFiles(Array.from(files));

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle file drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

        uploadFiles(Array.from(e.dataTransfer.files));
    };

    // Handle file upload
    const uploadFiles = (files: File[]) => {
        // Check if adding these files would exceed the max number of images
        if (images.length + files.length > maxImages) {
            toast.error(`Chỉ được tải lên tối đa ${maxImages} hình ảnh`);
            return;
        }

        // Filter only image files
        const imageFiles = files.filter((file) =>
            file.type.startsWith("image/")
        );

        if (imageFiles.length !== files.length) {
            toast.error("Chỉ chấp nhận file hình ảnh");
        }

        // Check file sizes (max 5MB each)
        const validFiles = imageFiles.filter((file) => {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`File ${file.name} vượt quá 5MB`);
                return false;
            }
            return true;
        });

        // In a real app, you would upload these files to a server
        // For demo purposes, we'll use URL.createObjectURL
        const newImageUrls = validFiles.map((file) =>
            URL.createObjectURL(file)
        );

        // Add new images to the array
        onChange([...images, ...newImageUrls]);
    };

    // Handle drag events
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Remove an image
    const removeImage = (index: number) => {
        const newImages = [...images];
        // Revoke object URL to avoid memory leaks
        if (newImages[index].startsWith("blob:")) {
            URL.revokeObjectURL(newImages[index]);
        }
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-primary"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <h3 className="font-medium">
                        Kéo thả hoặc click để tải ảnh lên
                    </h3>
                    <p className="text-sm text-gray-500">
                        Hỗ trợ JPG, PNG hoặc GIF. Tối đa {maxImages} ảnh, mỗi
                        ảnh không quá 5MB.
                    </p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Image preview grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                                <Image
                                    src={image}
                                    alt={`Arena image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            {index === 0 && (
                                <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    Ảnh bìa
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Add more button (if under max) */}
                    {images.length < maxImages && (
                        <div
                            className="aspect-square rounded-md border border-dashed flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                    Thêm ảnh
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
