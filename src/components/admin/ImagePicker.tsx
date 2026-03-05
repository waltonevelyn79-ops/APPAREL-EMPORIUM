'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Search, Folder, X, CheckCircle, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import FileUpload from '@/components/ui/FileUpload';

interface MediaFile {
    id: string;
    filePath: string;
    originalName: string;
    folder: string;
}

interface ImagePickerProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
}

export default function ImagePicker({ value, onChange, folder = 'general' }: ImagePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                limit: '48',
                ...(search && { search })
            });
            const res = await fetch(`/api/media?${query.toString()}`);
            const data = await res.json();
            if (data.files) {
                setMedia(data.files);
            }
        } catch (error) {
            console.error("Failed to fetch library", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'library') {
            const debounce = setTimeout(() => {
                fetchMedia();
            }, search ? 500 : 0);
            return () => clearTimeout(debounce);
        }
    }, [isOpen, search, activeTab]);

    const handleSelect = (filePath: string) => {
        onChange(filePath);
        setIsOpen(false);
    };

    const handleUploadComplete = (files: any[]) => {
        if (files && files.length > 0) {
            onChange(files[0].filePath);
            setIsOpen(false);
        }
    };

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

            {/* The Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Folder className="text-primary w-5 h-5" /> Select Media
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-dark-surface p-6">

                            {/* Tabs */}
                            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-800">
                                <button
                                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 px-1 ${activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('library')}
                                >
                                    Media Library
                                </button>
                                <button
                                    className={`pb-3 font-semibold text-sm transition-colors border-b-2 px-1 ${activeTab === 'upload' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('upload')}
                                >
                                    Upload New
                                </button>
                            </div>

                            {activeTab === 'library' ? (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search previously uploaded files..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary text-sm shadow-sm"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        {loading ? (
                                            <div className="flex justify-center items-center h-40">
                                                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
                                            </div>
                                        ) : media.length === 0 ? (
                                            <div className="text-center py-20 bg-gray-50 dark:bg-dark-bg rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 text-sm">No images found matching your search.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 pb-8">
                                                {media.map(file => (
                                                    <div
                                                        key={file.id}
                                                        onClick={() => handleSelect(file.filePath)}
                                                        className={`relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer group bg-gray-100 ${value === file.filePath ? 'border-primary shadow-[0_0_0_2px_rgba(var(--color-primary),0.2)]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                                    >
                                                        <Image src={file.filePath} alt={file.originalName} fill className="object-cover" unoptimized />
                                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        {value === file.filePath && (
                                                            <div className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full shadow-md z-10 w-5 h-5 flex items-center justify-center">
                                                                <CheckCircle size={14} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    <FileUpload onUploadComplete={handleUploadComplete} folder={folder} multiple={false} />
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
