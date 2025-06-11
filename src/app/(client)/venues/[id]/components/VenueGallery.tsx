"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import Image from "next/image";

interface VenueGalleryProps {
    images: string[];
}

export default function VenueGallery({ images }: VenueGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    const openLightbox = (index: number) => {
        setCurrentImage(index);
        setLightboxOpen(true);
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = "auto";
    };

    const navigateLightbox = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setCurrentImage((prev) =>
                prev === 0 ? images.length - 1 : prev - 1
            );
        } else {
            setCurrentImage((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                    Chưa có hình ảnh
                </h4>
                <p className="text-gray-500 max-w-md mx-auto">
                    Bộ sưu tập hình ảnh của nhà thi đấu này đang được cập nhật.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-2xl font-bold mb-8 flex items-center text-gray-800">
                Bộ sưu tập hình ảnh ({images.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity shadow-sm hover:shadow-md group"
                        onClick={() => openLightbox(index)}
                    >
                        <div className="w-full h-full relative">
                            <Image
                                src={getImageUrl(image)}
                                alt={`Hình ảnh nhà thi đấu ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 scale-0 group-hover:scale-100 transition-transform">
                                    <ImageIcon className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox - Vẫn giữ nguyên dạng img vì đây là UI động và hiển thị tạm thời */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center backdrop-blur-sm">
                    <button
                        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        onClick={closeLightbox}
                        aria-label="Đóng"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors"
                        onClick={() => navigateLightbox("prev")}
                        aria-label="Ảnh trước"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center">
                        <img
                            src={getImageUrl(images[currentImage])}
                            alt={`Hình ảnh nhà thi đấu ${currentImage + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/30 py-2 backdrop-blur-sm">
                            <span className="font-medium">
                                {currentImage + 1}
                            </span>{" "}
                            / {images.length}
                        </div>
                    </div>

                    <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors"
                        onClick={() => navigateLightbox("next")}
                        aria-label="Ảnh tiếp theo"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            )}
        </div>
    );
}
