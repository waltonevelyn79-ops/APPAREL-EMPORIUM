'use client';

import { useState } from 'react';

export default function ProductImageGallery({ images }: { images: string[] }) {
    const [activeImage, setActiveImage] = useState(images[0] || '/images/placeholder-product.svg');

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {activeImage.endsWith('.svg') ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="text-6xl text-gray-300">No Image</span>
                    </div>
                ) : (
                    <img
                        src={activeImage}
                        alt="Product image"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
                                }`}
                        >
                            {img.endsWith('.svg') ? (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-800"></div>
                            ) : (
                                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
