"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CourtGalleryProps {
    images: string[];
}

export default function CourtGallery({ images }: CourtGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    // Xử lý URL ảnh
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

    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    };

    // Nếu không có ảnh
    if (!images.length) {
        return (
            <div className="bg-gray-50 rounded-xl p-10 text-center">
                <div className="text-gray-500">Không có hình ảnh</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                        onClick={() => openLightbox(index)}
                    >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                Xem
                            </span>
                        </div>
                        <img
                            src={getImageUrl(image)}
                            alt={`Court image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                if (
                                    e.currentTarget.src !==
                                    "/images/placeholder.jpg"
                                ) {
                                    e.currentTarget.src =
                                        "/images/placeholder.jpg";
                                }
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        onClick={closeLightbox}
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <button
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                        onClick={prevImage}
                    >
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <button
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                        onClick={nextImage}
                    >
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    <div className="max-w-4xl max-h-[80vh]">
                        <img
                            src={getImageUrl(images[currentImage])}
                            alt="Court image"
                            className="max-w-full max-h-[80vh] object-contain"
                            onError={(e) => {
                                if (
                                    e.currentTarget.src !==
                                    "/images/placeholder.jpg"
                                ) {
                                    e.currentTarget.src =
                                        "/images/placeholder.jpg";
                                }
                            }}
                        />
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                        {currentImage + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    );
}
