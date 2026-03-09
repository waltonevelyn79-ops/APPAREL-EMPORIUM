'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { usePermission } from '@/hooks/usePermission';
import { Menu, Plus, Trash2, Edit2, ChevronDown, ChevronRight, GripVertical, AlertTriangle, Save, FolderTree, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

type MegaMenuLink = { label: string; url: string };

type MegaMenuSection = {
    header: string;
    links: MegaMenuLink[];
};

type MegaMenuColumn = {
    title: string;
    image?: string;
    sections?: MegaMenuSection[];
    links?: MegaMenuLink[]; // Fallback for flatter structure
};

type MenuItem = {
    id: string;
    label: string;
    url: string;
    target: string;
    icon: string | null;
    parentId: string | null;
    order: number;
    isMegaMenu: boolean;
    megaMenuData: string | null;
    active: boolean;
    children?: MenuItem[];
};

const SUGGESTED_URLS = ['/', '/products', '/about', '/contact', '/blog'];

export default function MenuBuilderPage() {
    const { role } = usePermission();
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [flatMenus, setFlatMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLocation, setActiveLocation] = useState<'main' | 'footer' | 'mobile'>('main');
    const [saving, setSaving] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        label: '',
        url: '',
        target: '_self',
        icon: '',
        parentId: '',
        isMegaMenu: false,
        active: true
    });
    const [megaMenuData, setMegaMenuData] = useState<MegaMenuColumn[]>([]);

    useEffect(() => {
        fetchMenus();
    }, [activeLocation]);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/menus?location=${activeLocation}`);
            const data = await res.json();
            if (data.success) {
                setMenus(data.menus);
                setFlatMenus(data.flat);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...formData,
            menuLocation: activeLocation,
            parentId: formData.parentId || null,
            megaMenuData: formData.isMegaMenu ? megaMenuData : null
        };

        try {
            const url = editingNode ? '/api/menus' : '/api/menus';
            const method = editingNode ? 'PUT' : 'POST';

            const reqPayload = editingNode ? { id: editingNode.id, ...payload } : payload;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqPayload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchMenus();
            }
        } catch (error) {
            console.error('Menu save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this menu item and all its sub-items?')) return;
        try {
            await fetch(`/api/menus?id=${id}`, { method: 'DELETE' });
            fetchMenus();
        } catch (e) {
            console.error('Delete error', e);
        }
    };

    const openEditModal = (item: MenuItem) => {
        setEditingNode(item);
        setFormData({
            label: item.label,
            url: item.url,
            target: item.target,
            icon: item.icon || '',
            parentId: item.parentId || '',
            isMegaMenu: item.isMegaMenu,
            active: item.active
        });
        setMegaMenuData(item.megaMenuData ? JSON.parse(item.megaMenuData) : []);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingNode(null);
        setFormData({
            label: '',
            url: '',
            target: '_self',
            icon: '',
            parentId: '',
            isMegaMenu: false,
            active: true
        });
        setMegaMenuData([]);
        setIsModalOpen(true);
    };

    // Mega Menu Column Handlers
    const addMegaSection = (colIdx: number) => {
        const newData = [...megaMenuData];
        if (!newData[colIdx].sections) newData[colIdx].sections = [];
        newData[colIdx].sections!.push({ header: 'New Section', links: [] });
        setMegaMenuData(newData);
    };
    const updateMegaSection = (colIdx: number, secIdx: number, field: string, value: string) => {
        const newData = [...megaMenuData];
        (newData[colIdx].sections![secIdx] as any)[field] = value;
        setMegaMenuData(newData);
    };
    const addMegaLink = (colIdx: number, secIdx: number) => {
        const newData = [...megaMenuData];
        newData[colIdx].sections![secIdx].links.push({ label: 'New Link', url: '/' });
        setMegaMenuData(newData);
    };
    const updateMegaLink = (colIdx: number, secIdx: number, linkIdx: number, field: string, value: string) => {
        const newData = [...megaMenuData];
        (newData[colIdx].sections![secIdx].links[linkIdx] as any)[field] = value;
        setMegaMenuData(newData);
    };
    const removeMegaColumn = (colIdx: number) => {
        setMegaMenuData(megaMenuData.filter((_, i) => i !== colIdx));
    };
    const removeMegaSection = (colIdx: number, secIdx: number) => {
        const newData = [...megaMenuData];
        newData[colIdx].sections = newData[colIdx].sections!.filter((_, i) => i !== secIdx);
        setMegaMenuData(newData);
    };
    const removeMegaLink = (colIdx: number, secIdx: number, linkIdx: number) => {
        const newData = [...megaMenuData];
        newData[colIdx].sections![secIdx].links = newData[colIdx].sections![secIdx].links.filter((_, i) => i !== linkIdx);
        setMegaMenuData(newData);
    };

    // Native Drag and Drop Logic
    const [draggedNode, setDraggedNode] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
        setDraggedNode(id);
    };

    const handleDrop = async (e: React.DragEvent, targetId: string | null, targetOrder: number, newParentId: string | null) => {
        e.preventDefault();
        const srcId = e.dataTransfer.getData('text/plain');
        if (srcId === targetId) return;

        // Recursive tree flattener algorithm mapped out here normally
        // For simplicity hitting the backend with the single movement update usually fires
        // the reorder correctly, but building the array locally is better:

        let newFlatList = [...flatMenus];
        const srcItem = newFlatList.find(x => x.id === srcId);
        if (!srcItem) return;

        // Change parent
        srcItem.parentId = newParentId;

        // Quick local mapping to force order 
        const siblings = newFlatList.filter(x => x.parentId === newParentId).sort((a, b) => a.order - b.order);

        // Re-calculate orders
        let currentIndex = 0;
        const reorderedPayload: any[] = [];

        siblings.forEach((sib) => {
            if (sib.id === srcId) return; // skip self
            if (currentIndex === targetOrder) {
                reorderedPayload.push({ id: srcId, order: currentIndex++, parentId: newParentId });
            }
            reorderedPayload.push({ id: sib.id, order: currentIndex++, parentId: newParentId });
        });
        if (!reorderedPayload.find(x => x.id === srcId)) {
            reorderedPayload.push({ id: srcId, order: currentIndex, parentId: newParentId });
        }

        // Hit API
        try {
            await fetch('/api/menus/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: reorderedPayload })
            });
            fetchMenus();
        } catch (err) {
            console.error("Reorder failed");
        }
        setDraggedNode(null);
    };


    const renderTree = (items: MenuItem[], depth = 0) => {
        return (
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id}>
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, item.id, index, item.parentId)}
                            className={`flex items-center justify-between p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm transition hover:border-primary/50 group ${draggedNode === item.id ? 'opacity-50' : ''}`}
                            style={{ marginLeft: `${depth * 24}px` }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-gray-400 cursor-grab active:cursor-grabbing hover:text-primary">
                                    <GripVertical size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold flex items-center gap-2">
                                        {item.label}
                                        {!item.active && <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] uppercase font-bold tracking-widest">Hidden</span>}
                                        {item.isMegaMenu && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] uppercase font-bold tracking-widest">Mega UI</span>}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">{item.url}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(item)} className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded transition">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Drop zone for nesting */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, null, 0, item.id)}
                            className="h-2 w-full mt-1 ml-6 rounded transition-colors drag-over:bg-primary/20"
                        />

                        {item.children && item.children.length > 0 && (
                            <div className="mt-2">
                                {renderTree(item.children, depth + 1)}
                            </div>
                        )}
                    </div>
                ))}

                {/* Fallback empty drag zone */}
                {items.length === 0 && (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, null, items.length, depth === 0 ? null : items[0]?.parentId)}
                        className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-center text-sm text-gray-400"
                    >
                        Drop items here
                    </div>
                )}
            </div>
        );
    };


    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Access Denied</h2>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <FolderTree className="text-primary" /> Navigation Builder
                    </h1>
                    <p className="text-gray-500 text-sm">Design main menus, footer links, and mobile drawers across the site.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm font-medium"
                >
                    <Plus size={18} /> Add Menu Item
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl mb-6 w-full max-w-lg">
                {[
                    { id: 'main', label: 'Main Nav', icon: <Icons.Layout size={14} /> },
                    { id: 'footer', label: 'Footer Links', icon: <Icons.List size={14} /> },
                    { id: 'mobile', label: 'Mobile Drawer', icon: <Icons.Smartphone size={14} /> }
                ].map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => setActiveLocation(loc.id as any)}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-extrabold uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${activeLocation === loc.id ? 'bg-white dark:bg-dark-surface shadow-md text-primary scale-[1.02]' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        {loc.icon}
                        {loc.label}
                    </button>
                ))}
            </div>

            {/* Tree Area */}
            <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div></div>
                ) : menus.length === 0 ? (
                    <div className="text-center py-20">
                        <Menu className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="font-semibold text-gray-600 mb-2">No menu items yet</h4>
                        <p className="text-sm text-gray-500">Click the add button above to start building.</p>
                    </div>
                ) : (
                    renderTree(menus, 0)
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold">{editingNode ? 'Edit Menu Item' : 'New Menu Item'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"><X size={20} /></button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <form id="menu-form" onSubmit={handleSaveMenu} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Label</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.label}
                                            onChange={e => setFormData({ ...formData, label: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary dark:bg-dark-bg dark:border-gray-700"
                                            placeholder="e.g. Menswear"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Target URL</label>
                                        <input
                                            required
                                            type="text"
                                            list="urls"
                                            value={formData.url}
                                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary dark:bg-dark-bg dark:border-gray-700 font-mono"
                                            placeholder="/products/menswear"
                                        />
                                        <datalist id="urls">
                                            {SUGGESTED_URLS.map(u => <option key={u} value={u} />)}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Parent Menu (Nesting)</label>
                                        <select
                                            value={formData.parentId}
                                            onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary dark:bg-dark-bg dark:border-gray-700"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {flatMenus.filter(m => m.id !== editingNode?.id).map(m => (
                                                <option key={m.id} value={m.id}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-3">
                                        <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                                            <input
                                                type="checkbox"
                                                checked={formData.target === '_blank'}
                                                onChange={e => setFormData({ ...formData, target: e.target.checked ? '_blank' : '_self' })}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            Open in New Tab
                                        </label>
                                    </div>
                                    <div className="flex items-end pb-3">
                                        <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                                            <input
                                                type="checkbox"
                                                checked={formData.active}
                                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            Visible / Active
                                        </label>
                                    </div>
                                </div>

                                {/* Mega Menu Toggles */}
                                {activeLocation === 'main' && !formData.parentId && (
                                    <div className="pt-6 border-t dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg">Mega Menu Layout</h4>
                                                <p className="text-xs text-gray-500">Transform this top-level link into a massive hover-dropdown rich media menu.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.isMegaMenu}
                                                    onChange={e => setFormData({ ...formData, isMegaMenu: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        {formData.isMegaMenu && (
                                            <div className="space-y-6 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {megaMenuData.map((col, cIdx) => (
                                                        <div key={cIdx} className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <input
                                                                    type="text"
                                                                    value={col.title}
                                                                    onChange={(e) => {
                                                                        const nd = [...megaMenuData];
                                                                        nd[cIdx].title = e.target.value;
                                                                        setMegaMenuData(nd);
                                                                    }}
                                                                    className="font-bold text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-primary w-2/3 pb-1"
                                                                />
                                                                <button type="button" onClick={() => removeMegaColumn(cIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={14} /></button>
                                                            </div>

                                                            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                                                                {(col.sections || []).map((section, sIdx) => (
                                                                    <div key={sIdx} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg space-y-3 relative">
                                                                        <div className="flex justify-between gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={section.header}
                                                                                onChange={(e) => updateMegaSection(cIdx, sIdx, 'header', e.target.value)}
                                                                                className="font-extrabold text-[10px] uppercase tracking-widest bg-transparent border-b border-gray-200 dark:border-gray-800 focus:outline-none w-full"
                                                                                placeholder="Section Header"
                                                                            />
                                                                            <button type="button" onClick={() => removeMegaSection(cIdx, sIdx)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            {(section.links || []).map((link, lIdx) => (
                                                                                <div key={lIdx} className="flex gap-2">
                                                                                    <input
                                                                                        type="text" value={link.label} onChange={(e) => updateMegaLink(cIdx, sIdx, lIdx, 'label', e.target.value)}
                                                                                        placeholder="Label" className="w-1/2 text-[10px] p-2 border rounded-lg dark:bg-dark-bg dark:border-gray-800"
                                                                                    />
                                                                                    <input
                                                                                        type="text" value={link.url} onChange={(e) => updateMegaLink(cIdx, sIdx, lIdx, 'url', e.target.value)}
                                                                                        placeholder="URL" className="w-1/2 text-[10px] p-2 border rounded-lg dark:bg-dark-bg dark:border-gray-800 font-mono"
                                                                                    />
                                                                                    <button type="button" onClick={() => removeMegaLink(cIdx, sIdx, lIdx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => addMegaLink(cIdx, sIdx)}
                                                                            className="w-full py-2 border border-dashed border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/5 transition-colors"
                                                                        >
                                                                            + Add Link
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => addMegaSection(cIdx)}
                                                                className="mt-4 w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                                            >
                                                                + Add Section
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setMegaMenuData([...megaMenuData, { title: 'New Column', sections: [] }])}
                                                    className="px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all w-full shadow-lg"
                                                >
                                                    + Add Brand Column Stack
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
                            <button type="submit" form="menu-form" disabled={saving} className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition flex items-center gap-2">
                                <Save size={18} /> {saving ? 'Saving...' : 'Save Menu'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

