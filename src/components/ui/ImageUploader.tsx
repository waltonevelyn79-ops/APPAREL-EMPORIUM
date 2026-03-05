import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
    onUpload: (v: string) => void;
    value?: string;
    folder?: string;
}

export default function ImageUploader({ onUpload, value, folder = 'general' }: FileUploadProps) {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success && data.file) {
                onUpload(data.file.filePath);
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Upload failed.');
        }
    }, [folder, onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    if (value) {
        return (
            <div className="relative inline-block border rounded-lg overflow-hidden group">
                <img src={value} alt="Uploaded" className="h-32 w-auto object-cover" />
                <button
                    onClick={(e) => { e.preventDefault(); onUpload(''); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}`}>
            <input {...getInputProps()} />
            <UploadCloud size={24} className={`mx-auto mb-2 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
            <p className="text-sm font-bold text-gray-700">Drag & drop image here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse files</p>
        </div>
    );
}
