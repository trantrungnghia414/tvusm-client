"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface VenueGalleryProps {
    images: string[];
}

export default function VenueGallery({ images }: VenueGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    // Hàm xử lý URL ảnh
    const getImageUrl = (path: string): string => {
        if (!path) return "/images/placeholder.jpg";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        if (path.startsWith("/uploads")) {
            return `http://localhost:3000${path}`;
        }

        return path;
    };

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
            <div className="text-center py-10 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Không có hình ảnh</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-bold mb-6">
                Bộ sưu tập hình ảnh ({images.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={getImageUrl(image)}
                            alt={`Hình ảnh nhà thi đấu ${index + 1}`}
                            className="object-cover w-full h-full"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
                    <button
                        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
                        onClick={closeLightbox}
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
                        onClick={() => navigateLightbox("prev")}
                    >
                        &lt;
                    </button>

                    <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
                        <img
                            src={getImageUrl(images[currentImage])}
                            alt={`Hình ảnh nhà thi đấu ${currentImage + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                            {currentImage + 1} / {images.length}
                        </div>
                    </div>

                    <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white"
                        onClick={() => navigateLightbox("next")}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
