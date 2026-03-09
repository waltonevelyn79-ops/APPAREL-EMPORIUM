'use client';

import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductImageGallery({ images, alts }: { images: string[]; alts?: string[] }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);

    const activeImage = images[activeIdx] || '/images/placeholder-product.svg';
    const activeAlt = alts?.[activeIdx] || 'Product image';
    const isPlaceholder = activeImage.endsWith('.svg');

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoomed || !imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }, [zoomed]);

    const handleMouseLeave = useCallback(() => {
        setZoomed(false);
    }, []);

    const nextImage = () => setActiveIdx((p) => (p + 1) % images.length);
    const prevImage = () => setActiveIdx((p) => (p - 1 + images.length) % images.length);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image with Zoom */}
            <div
                ref={imageRef}
                className={`relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 ${!isPlaceholder ? 'cursor-zoom-in' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => !isPlaceholder && setZoomed(true)}
                onMouseLeave={handleMouseLeave}
                onClick={() => !isPlaceholder && setLightboxOpen(true)}
            >
                {isPlaceholder ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="text-6xl text-gray-300">No Image</span>
                    </div>
                ) : (
                    <>
                        <img
                            src={activeImage}
                            alt={activeAlt}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                            style={zoomed ? {
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                                transform: 'scale(2.2)',
                                transition: 'transform 0.1s ease-out',
                            } : {
                                transform: 'scale(1)',
                                transition: 'transform 0.3s ease-out'
                            }}
                        />

                        {/* Zoom indicator */}
                        <div className={`absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-md transition-opacity duration-300 ${zoomed ? 'opacity-0' : 'opacity-100'}`}>
                            <ZoomIn size={18} className="text-gray-600 dark:text-gray-300" />
                        </div>

                        {/* Fullscreen button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                            className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity z-10"
                            title="View fullscreen"
                        >
                            <ZoomOut size={18} className="text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Navigation arrows for multiple images */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-md z-10 hover:bg-primary hover:text-white transition-all"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-md z-10 hover:bg-primary hover:text-white transition-all"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}

                        {/* Image counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                {activeIdx + 1} / {images.length}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIdx(idx)}
                            className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeIdx === idx
                                    ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-60 hover:opacity-100'
                                }`}
                        >
                            {img.endsWith('.svg') ? (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
                            ) : (
                                <img
                                    src={img}
                                    alt={alts?.[idx] || `View ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && !isPlaceholder && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <X size={24} />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                className="absolute right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            >
                                <ChevronRight size={28} />
                            </button>
                        </>
                    )}

                    <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={activeImage}
                            alt={activeAlt}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                        {alts?.[activeIdx] && (
                            <p className="text-center text-white/70 text-sm mt-3 font-medium">{alts[activeIdx]}</p>
                        )}
                    </div>

                    {/* Thumbnail strip in lightbox */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4" onClick={(e) => e.stopPropagation()}>
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIdx(idx)}
                                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${activeIdx === idx ? 'border-white scale-110' : 'border-white/30 opacity-50 hover:opacity-80'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
