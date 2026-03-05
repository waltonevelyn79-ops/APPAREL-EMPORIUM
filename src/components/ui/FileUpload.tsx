'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
    folder?: string;
    multiple?: boolean;
    accept?: Record<string, string[]>;
    maxSize?: number;
    onUploadComplete?: (files: any[]) => void;
}

const DEFAULT_ACCEPT = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg']
};

export default function FileUpload({
    folder = 'general',
    multiple = false,
    accept = DEFAULT_ACCEPT,
    maxSize = 5 * 1024 * 1024, // 5MB
    onUploadComplete
}: FileUploadProps) {
    const [queue, setQueue] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const xhrRef = useRef<XMLHttpRequest | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setErrors([]);

        // Handle Rejections
        if (fileRejections.length > 0) {
            const errorMsgs = fileRejections.map(r =>
                `${r.file.name}: ${r.errors.map((e: any) => e.message).join(', ')}`
            );
            setErrors(errorMsgs);
        }

        // Handle Accepted
        if (acceptedFiles.length > 0) {
            setQueue(prev => multiple ? [...prev, ...acceptedFiles] : [acceptedFiles[0]]);
        }
    }, [multiple]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple
    });

    const removeFile = (index: number) => {
        setQueue(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (queue.length === 0) return;

        setUploading(true);
        setProgress(0);
        setErrors([]);

        const formData = new FormData();
        queue.forEach(file => formData.append('file', file));
        formData.append('folder', folder);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                setProgress(Math.round(percentComplete));
            }
        });

        xhr.addEventListener('load', () => {
            setUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        setQueue([]);
                        setProgress(0);
                        if (onUploadComplete) onUploadComplete(response.files);
                    } else {
                        setErrors([response.error || 'Upload failed due to an unknown server error.']);
                    }
                } catch (err) {
                    setErrors(['Failed to parse server response.']);
                }
            } else {
                setErrors([`Server returned status ${xhr.status}`]);
            }
        });

        xhr.addEventListener('error', () => {
            setUploading(false);
            setErrors(['Network error occurred during upload.']);
        });

        xhr.addEventListener('abort', () => {
            setUploading(false);
            setErrors(['Upload cancelled.']);
        });

        xhr.open('POST', '/api/upload', true);
        xhr.send(formData);
    };

    const cancelUpload = () => {
        if (xhrRef.current) {
            xhrRef.current.abort();
        }
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
                ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
                ${isDragReject ? 'border-red-500 bg-red-50' : ''}
                ${!isDragActive && !isDragReject ? 'border-gray-300 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-dark-surface' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                    <UploadCloud className={`w-12 h-12 mb-3 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {isDragActive
                            ? "Drop the files here..."
                            : "Drag & drop files here, or click to browse"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Supported: JPG, PNG, WEBP, GIF, SVG (Max {(maxSize / 1024 / 1024).toFixed(0)}MB per file)
                    </p>
                </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {errors.map((err, i) => (
                        <p key={i} className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle size={14} /> {err}
                        </p>
                    ))}
                </div>
            )}

            {/* Queue Preview */}
            {queue.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Files ready to upload ({queue.length})
                    </h4>
                    <div className="space-y-3">
                        {queue.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="relative w-10 h-10 shrink-0 bg-gray-100 rounded overflow-hidden">
                                        {file.type.startsWith('image/') ? (
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <File className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full">
                            {uploading && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-primary">Uploading...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300 ease-out flex items-center justify-center relative"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 shrink-0">
                            {uploading ? (
                                <button
                                    onClick={cancelUpload}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setQueue([])}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition flex items-center gap-2"
                                    >
                                        <UploadCloud size={16} /> Start Upload
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
