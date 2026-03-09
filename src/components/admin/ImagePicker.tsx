'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import MediaLibraryModal from './MediaLibraryModal';

interface ImagePickerProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
}

export default function ImagePicker({ value, onChange, folder = 'general' }: ImagePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            {/* The Trigger UI */}
            {value ? (
                <div className="relative w-full aspect-video md:aspect-[3/1] bg-gray-100 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden group cursor-pointer" onClick={() => setIsOpen(true)}>
                    <Image src={value} alt="Selected Asset" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <ImageIcon className="text-white w-8 h-8 mb-2" />
                        <span className="text-white font-medium text-sm border-2 border-white/50 px-3 py-1 rounded-full">Change Image</span>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Remove Image"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 rounded-xl transition-colors bg-gray-50 dark:bg-dark-surface"
                >
                    <ImageIcon className="text-gray-400 w-8 h-8 mb-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose Image or Upload</span>
                </button>
            )}

            <MediaLibraryModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSelect={onChange}
                folder={folder}
                selectedValue={value}
            />
        </div>
    );
}
