'use client';

import { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import FileUpload from '@/components/ui/FileUpload';
import { Image as ImageIcon, Search, Filter, Trash2, X, Download, Copy, List, Grid, ImageOff } from 'lucide-react';
import Image from 'next/image';

interface MediaFile {
    id: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    folder: string;
    alt: string | null;
    createdAt: string;
    user: { name: string; email: string };
}

export default function MediaLibraryPage() {
    const { role } = usePermission();
    const canUpload = ['EDITOR', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(role || '');
    const canDelete = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(role || '');

    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [folder, setFolder] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [altText, setAltText] = useState('');
    const [isSavingAlt, setIsSavingAlt] = useState(false);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '24',
                ...(folder !== 'all' && { folder }),
                ...(search && { search })
            });
            const res = await fetch(`/api/media?${query.toString()}`);
            const data = await res.json();

            if (data.files) {
                setMedia(data.files);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchMedia();
        }, search ? 500 : 0);
        return () => clearTimeout(debounce);
    }, [page, folder, search]);

    const handleUploadComplete = () => {
        setPage(1);
        fetchMedia(); // Refresh list
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === media.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(media.map(m => m.id)));
    };

    const deleteMedia = async (ids: string[]) => {
        if (!confirm(`Are you sure you want to delete ${ids.length} files? This cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/media?ids=${ids.join(',')}`, { method: 'DELETE' });
            if (res.ok) {
                setSelectedIds(new Set());
                setSelectedFile(null);
                fetchMedia();
            } else {
                alert('Deletion failed');
            }
        } catch (error) {
            alert('Deletion error');
        } finally {
            setIsDeleting(false);
        }
    };

    const saveAltText = async () => {
        if (!selectedFile) return;
        setIsSavingAlt(true);
        try {
            const res = await fetch(`/api/media`, {
                method: 'PUT',
                body: JSON.stringify({ id: selectedFile.id, alt: altText })
            });
            if (res.ok) {
                setSelectedFile({ ...selectedFile, alt: altText });
                fetchMedia(); // Silent background refresh
            }
        } finally {
            setIsSavingAlt(false);
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url);
        alert('URL copied to clipboard!');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!canUpload) {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <ImageIcon className="text-primary" /> Media Library
                    </h1>
                    <p className="text-gray-500 text-sm">Upload, manage, and delete image assets.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-1.5 rounded transition ${view === 'grid' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-1.5 rounded transition ${view === 'list' ? 'bg-white dark:bg-dark-surface shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {canDelete && selectedIds.size > 0 && (
                        <button
                            onClick={() => deleteMedia(Array.from(selectedIds))}
                            disabled={isDeleting}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center gap-2 shadow-sm"
                        >
                            <Trash2 size={16} /> Delete Selected ({selectedIds.size})
                        </button>
                    )}
                </div>
            </div>

            {/* Uploader UI */}
            <div className="mb-8">
                <FileUpload onUploadComplete={handleUploadComplete} folder={folder === 'all' ? 'general' : folder} multiple={true} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by filename..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary text-sm"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={folder}
                        onChange={(e) => { setFolder(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-primary text-sm appearance-none font-medium text-gray-700 dark:text-gray-200"
                    >
                        <option value="all">All Folders</option>
                        <option value="general">General</option>
                        <option value="products">Products</option>
                        <option value="blog">Blog</option>
                        <option value="logos">Logos & Icons</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading && media.length === 0 ? (
                <div className="py-20 flex justify-center border border-dashed rounded-xl"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div></div>
            ) : media.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-900/10 rounded-xl border border-dashed dark:border-gray-800">
                    <ImageOff className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No media files found</h3>
                    <p className="text-gray-500 text-sm">Upload images to get started, or clear your search filters.</p>
                </div>
            ) : (
                <>
                    {view === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {media.map((file) => (
                                <div
                                    key={file.id}
                                    className={`relative group bg-gray-100 dark:bg-dark-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border-2
                                    ${selectedIds.has(file.id) ? 'border-primary' : 'border-transparent dark:border-gray-800'}`}
                                >
                                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(file.id)}
                                            onChange={() => toggleSelect(file.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary !cursor-pointer bg-white shadow-sm"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm uppercase">
                                        {file.folder}
                                    </div>

                                    <div className="aspect-square relative bg-white dark:bg-black/20" onClick={() => setSelectedFile(file)}>
                                        <Image
                                            src={file.filePath}
                                            alt={file.alt || file.originalName}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                            className="object-contain"
                                            unoptimized // For SVGs and direct local hits
                                        />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-dark-surface" onClick={() => setSelectedFile(file)}>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-white truncate" title={file.originalName}>
                                            {file.originalName}
                                        </p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-gray-500">{formatSize(file.fileSize)}</p>
                                            <p className="text-[10px] tracking-tight text-gray-400 font-mono">
                                                {new Date(file.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden text-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-dark-bg text-gray-600 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="py-3 px-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === media.length && media.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="py-3 px-4">Preview</th>
                                        <th className="py-3 px-4">File Name</th>
                                        <th className="py-3 px-4">Folder</th>
                                        <th className="py-3 px-4">Size</th>
                                        <th className="py-3 px-4">Uploaded Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {media.map((file) => (
                                        <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-2 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(file.id)}
                                                    onChange={() => toggleSelect(file.id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary !cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-2 px-4 cursor-pointer" onClick={() => setSelectedFile(file)}>
                                                <div className="w-12 h-12 relative bg-gray-100 rounded overflow-hidden border">
                                                    <Image src={file.filePath} alt={file.originalName} fill className="object-cover" />
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 cursor-pointer" onClick={() => setSelectedFile(file)}>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">{file.originalName}</span>
                                            </td>
                                            <td className="py-2 px-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono uppercase">{file.folder}</span></td>
                                            <td className="py-2 px-4 text-gray-500">{formatSize(file.fileSize)}</td>
                                            <td className="py-2 px-4 text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border rounded-l bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                            >
                                Prev
                            </button>
                            <span className="px-4 py-2 bg-gray-50 font-medium text-sm border-y">
                                {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border rounded-r bg-white hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* DETAIL MODAL */}
            {selectedFile && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedFile(null); }}
                >
                    <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">

                        {/* Preview Area */}
                        <div className="w-full md:w-3/5 bg-gray-100 dark:bg-black p-6 flex flex-col relative h-[400px] md:h-auto items-center justify-center">
                            <Image
                                src={selectedFile.filePath}
                                alt={selectedFile.alt || selectedFile.originalName}
                                fill
                                className="object-contain p-4"
                            />
                            <a
                                href={selectedFile.filePath}
                                target="_blank"
                                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition backdrop-blur-md"
                            >
                                <Download size={20} />
                            </a>
                        </div>

                        {/* Details Area */}
                        <div className="w-full md:w-2/5 p-6 flex flex-col h-full overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold truncate pr-4 text-gray-900 dark:text-white" title={selectedFile.originalName}>
                                    File Details
                                </h3>
                                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-5 flex-1">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">File Name</label>
                                    <p className="text-sm font-medium break-all mt-1">{selectedFile.originalName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Size</label>
                                        <p className="text-sm font-mono mt-1">{formatSize(selectedFile.fileSize)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                                        <p className="text-sm mt-1">{new Date(selectedFile.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">URL Path</label>
                                    <div className="flex mt-1">
                                        <input
                                            readOnly
                                            value={selectedFile.filePath}
                                            className="w-full text-xs font-mono px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-l focus:outline-none"
                                        />
                                        <button onClick={() => copyUrl(selectedFile.filePath)} className="bg-gray-200 dark:bg-gray-700 px-3 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r hover:bg-gray-300 transition text-gray-700 dark:text-gray-300">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                                        Alt Text / Title
                                        {isSavingAlt && <span className="text-primary normal-case text-[10px] animate-pulse">Saving...</span>}
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Add SEO description..."
                                        defaultValue={selectedFile.alt || ''}
                                        onFocus={(e) => setAltText(e.target.value)}
                                        onChange={(e) => setAltText(e.target.value)}
                                        onBlur={saveAltText}
                                        className="w-full mt-1 text-sm px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded focus:border-primary focus:ring-1 focus:ring-primary"
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t dark:border-gray-800">
                                    <p className="text-xs text-gray-500">
                                        Uploaded by: <span className="font-semibold text-gray-800 dark:text-gray-300">{selectedFile.user?.name || 'System'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            {canDelete && (
                                <div className="mt-6 pt-4 border-t dark:border-gray-800">
                                    <button
                                        onClick={() => deleteMedia([selectedFile.id])}
                                        disabled={isDeleting}
                                        className="w-full py-2.5 flex justify-center items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg font-bold transition border border-red-200 hover:border-red-500"
                                    >
                                        <Trash2 size={18} /> {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
