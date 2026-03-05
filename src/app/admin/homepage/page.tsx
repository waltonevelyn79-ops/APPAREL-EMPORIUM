'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Eye, EyeOff, Edit2, GripVertical, Plus, Trash2, X, Save, AlertTriangle, LayoutDashboard } from 'lucide-react';
import * as Icons from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

type SectionID = 'announcement_bar' | 'hero_slider' | 'stats_counter' | 'category_grid' | 'featured_products' | 'why_choose_us' | 'certifications' | 'testimonials' | 'cta_section';

const SECTION_NAMES: Record<SectionID, string> = {
    announcement_bar: 'Announcement Bar',
    hero_slider: 'Hero Slider',
    stats_counter: 'Stats Counter',
    category_grid: 'Category Grid',
    featured_products: 'Featured Products',
    why_choose_us: 'Why Choose Us',
    certifications: 'Certifications',
    testimonials: 'Testimonials',
    cta_section: 'CTA Section'
};

const DEFAULT_ORDER: SectionID[] = [
    'hero_slider', 'stats_counter', 'category_grid', 'featured_products',
    'why_choose_us', 'certifications', 'testimonials', 'cta_section'
];

export default function HomepageBuilderPage() {
    const { role } = usePermission();
    const [order, setOrder] = useState<SectionID[]>(DEFAULT_ORDER);
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const [settingsData, setSettingsData] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor Modal state
    const [editingSection, setEditingSection] = useState<SectionID | null>(null);
    const [editorData, setEditorData] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings?group=homepage');
            const data = await res.json();

            if (data.settings) {
                const map: Record<string, string> = {};
                data.settings.forEach((s: any) => { map[s.key] = s.value; });
                setSettingsData(map);

                if (map['homepage_sections_order']) {
                    setOrder(JSON.parse(map['homepage_sections_order']));
                }
                if (map['homepage_sections_visibility']) {
                    setVisibility(JSON.parse(map['homepage_sections_visibility']));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveChanges = async (
        newOrder: SectionID[] = order,
        newVis: Record<string, boolean> = visibility,
        newKey?: string,
        newVal?: string
    ) => {
        setSaving(true);

        const payload: Record<string, string> = {
            homepage_sections_order: JSON.stringify(newOrder),
            homepage_sections_visibility: JSON.stringify(newVis)
        };

        if (newKey && newVal !== undefined) {
            payload[newKey] = newVal;
        }

        try {
            await Promise.all(
                Object.entries(payload).map(([k, v]) =>
                    fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ key: k, value: v, group: 'homepage' })
                    })
                )
            );

            // Revalidate frontend
            await fetch('/api/revalidate?path=/');
        } catch (e) {
            console.error('Save failed', e);
        } finally {
            setSaving(false);
            setEditingSection(null);
        }
    };

    // --- Drag & Drop Flow ---
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, idx: number) => {
        setDraggedIdx(idx);
        e.dataTransfer.effectAllowed = 'move';
        // Hide dragged ghost a bit
        setTimeout(() => e.target instanceof HTMLElement && e.target.classList.add('opacity-50'), 0);
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === idx) return;

        const newOrder = [...order];
        const draggedItem = newOrder.splice(draggedIdx, 1)[0];
        newOrder.splice(idx, 0, draggedItem);

        setOrder(newOrder);
        setDraggedIdx(idx);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.target instanceof HTMLElement && e.target.classList.remove('opacity-50');
        setDraggedIdx(null);
        await saveChanges(order, visibility);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.target instanceof HTMLElement && e.target.classList.remove('opacity-50');
        setDraggedIdx(null);
    };

    const toggleVisibility = async (id: SectionID) => {
        const newVis = { ...visibility, [id]: !(visibility[id] !== false) };
        setVisibility(newVis);
        await saveChanges(order, newVis);
    };

    const openEditor = (id: SectionID) => {
        let initialData: any = {};

        try {
            const raw = settingsData[`homepage_${id}`];
            if (raw) initialData = JSON.parse(raw);
        } catch (e) { }

        // Fallbacks for arrays
        if (!initialData || Object.keys(initialData).length === 0) {
            if (id === 'hero_slider') initialData = [];
            else if (id === 'stats_counter') initialData = [];
            else if (id === 'why_choose_us') initialData = [];
            else if (id === 'certifications') initialData = [];
            else if (id === 'testimonials') initialData = [];
            else if (id === 'cta_section') initialData = { heading: '', subheading: '', ctaText: '', ctaLink: '', image: '' };
            else if (id === 'announcement_bar') initialData = { text: '', link: '', bgColor: '#primary', textColor: '#ffffff' };
        }

        setEditorData(initialData);
        setEditingSection(id);
    };

    // --- Editor Helpers ---
    const updateEditorData = (field: string, val: any) => setEditorData({ ...editorData, [field]: val });

    // Arrays
    const addToArray = (baseObj: any) => setEditorData([...editorData, { id: Date.now().toString(), ...baseObj }]);
    const updateArrayItem = (idx: number, field: string, val: any) => {
        const arr = [...editorData];
        arr[idx][field] = val;
        setEditorData(arr);
    };
    const removeFromArray = (idx: number) => setEditorData(editorData.filter((_: any, i: number) => i !== idx));

    const saveEditor = async () => {
        if (!editingSection) return;
        await saveChanges(order, visibility, `homepage_${editingSection}`, JSON.stringify(editorData));
    };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3 font-heading">
                        <LayoutDashboard className="text-primary w-8 h-8" /> Homepage Builder
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">Drag to reorder sections, toggle visibility, and edit content entirely without code.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 font-mono text-xs items-center gap-2 px-3 shadow-inner">
                    <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                    {saving ? 'Syncing DB...' : 'Auto-Sync Live'}
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Draggable List */}
                    <div className="lg:col-span-5 space-y-4 bg-gray-50/50 dark:bg-gray-900/10 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><GripVertical className="text-gray-400" /> Section Hierarchy</h3>

                        {/* Static Announcement Bar (Order agnostic, just top) */}
                        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-dark-surface/60 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl shadow-sm mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-gray-300 pointer-events-none"><GripVertical size={20} /></div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">Announcement Bar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleVisibility('announcement_bar')} className={`p-2 rounded-md transition ${visibility['announcement_bar'] !== false ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                    {visibility['announcement_bar'] !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => openEditor('announcement_bar')} className="p-2 text-primary hover:bg-primary/10 rounded-md transition border border-primary/20">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Draggable Zone */}
                        <div className="space-y-4">
                            {order.map((sectionId, idx) => {
                                const isVisible = visibility[sectionId] !== false;
                                const isDraggable = !['category_grid', 'featured_products'].includes(sectionId); // Let's make all draggable to be consistent

                                return (
                                    <div
                                        key={sectionId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={handleDrop}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center justify-between p-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-move group
                                        ${!isVisible ? 'opacity-60 saturate-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-gray-400 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                                                <GripVertical size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{SECTION_NAMES[sectionId]}</span>
                                                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 mt-1">{sectionId}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => toggleVisibility(sectionId)}
                                                className={`p-2 rounded-md transition-colors ${isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                title={isVisible ? "Hide on LIVE" : "Show on LIVE"}
                                            >
                                                {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEditor(sectionId)}
                                                className="p-2 text-primary bg-primary/5 hover:bg-primary/20 hover:text-primary/80 rounded-md transition-colors"
                                                aria-label={`Edit ${SECTION_NAMES[sectionId]}`}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <div className="lg:col-span-7">
                        {editingSection ? (
                            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-primary/20 overflow-hidden sticky top-24 transform transition-all animate-in fade-in slide-in-from-right-8 duration-300">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
                                        <div className="w-2 h-6 bg-primary rounded-full"></div>
                                        Edit {SECTION_NAMES[editingSection]}
                                    </h3>
                                    <button onClick={() => setEditingSection(null)} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition"><X size={20} /></button>
                                </div>

                                <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">

                                    {/* ----- ANNOUNCEMENT BAR ----- */}
                                    {editingSection === 'announcement_bar' && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Announcement Text</label>
                                                <input type="text" value={editorData.text || ''} onChange={e => updateEditorData('text', e.target.value)} className="w-full px-4 py-2 border dark:border-gray-700 bg-gray-50 dark:bg-dark-bg rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Free shipping worldwide..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Redirect URL</label>
                                                <input type="text" value={editorData.link || ''} onChange={e => updateEditorData('link', e.target.value)} className="w-full px-4 py-2 border dark:border-gray-700 bg-gray-50 dark:bg-dark-bg rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary outline-none" placeholder="/sale" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">BG Color</label>
                                                    <div className="flex gap-2">
                                                        <input type="color" value={editorData.bgColor || '#1B365D'} onChange={e => updateEditorData('bgColor', e.target.value)} className="w-10 h-10 p-0.5 border rounded cursor-pointer" />
                                                        <input type="text" value={editorData.bgColor || '#1B365D'} onChange={e => updateEditorData('bgColor', e.target.value)} className="w-full px-3 border rounded text-sm font-mono" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Text Color</label>
                                                    <div className="flex gap-2">
                                                        <input type="color" value={editorData.textColor || '#FFFFFF'} onChange={e => updateEditorData('textColor', e.target.value)} className="w-10 h-10 p-0.5 border rounded cursor-pointer" />
                                                        <input type="text" value={editorData.textColor || '#FFFFFF'} onChange={e => updateEditorData('textColor', e.target.value)} className="w-full px-3 border rounded text-sm font-mono" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ----- CTA SECTION ----- */}
                                    {editingSection === 'cta_section' && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Headline</label>
                                                <input type="text" value={editorData.heading || ''} onChange={e => updateEditorData('heading', e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm font-bold bg-white dark:bg-dark-bg" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subheading Description</label>
                                                <textarea value={editorData.subheading || ''} onChange={e => updateEditorData('subheading', e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-dark-bg" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Button Text</label>
                                                    <input type="text" value={editorData.ctaText || ''} onChange={e => updateEditorData('ctaText', e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-dark-bg" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Button URL</label>
                                                    <input type="text" value={editorData.ctaLink || ''} onChange={e => updateEditorData('ctaLink', e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm font-mono bg-white dark:bg-dark-bg" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Parallax Graphic Overlay</label>
                                                <ImagePicker value={editorData.image || ''} onChange={url => updateEditorData('image', url)} />
                                            </div>
                                        </div>
                                    )}

                                    {/* ----- ARRAY BASED (Sliders, Stats, Certs, etc) ----- */}
                                    {Array.isArray(editorData) && editingSection !== 'category_grid' && editingSection !== 'featured_products' && (
                                        <div className="space-y-8">
                                            {editorData.map((item: any, idx: number) => (
                                                <div key={item.id || idx} className="bg-gray-50 dark:bg-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
                                                    <button onClick={() => removeFromArray(idx)} className="absolute top-3 right-3 p-1.5 bg-white text-red-500 border border-red-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"><Trash2 size={16} /></button>
                                                    <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center justify-center text-xs font-bold font-mono">
                                                        {idx + 1}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 pt-8">
                                                        {editingSection === 'hero_slider' && (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Slide Headline (HTML OK)</label>
                                                                        <input type="text" value={item.title} onChange={e => updateArrayItem(idx, 'title', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle</label>
                                                                        <textarea value={item.subtitle} onChange={e => updateArrayItem(idx, 'subtitle', e.target.value)} className="w-full text-sm p-2 border rounded" rows={2} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Btn Text</label>
                                                                        <input type="text" value={item.ctaText} onChange={e => updateArrayItem(idx, 'ctaText', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Btn Link</label>
                                                                        <input type="text" value={item.ctaLink} onChange={e => updateArrayItem(idx, 'ctaLink', e.target.value)} className="w-full text-sm p-2 border rounded font-mono" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Slide Wallpaper Graphics</label>
                                                                    <ImagePicker value={item.image || ''} onChange={url => updateArrayItem(idx, 'image', url)} />
                                                                </div>
                                                            </>
                                                        )}

                                                        {editingSection === 'why_choose_us' && (
                                                            <>
                                                                <div className="grid grid-cols-[1fr_3fr] gap-4">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Lucide Icon</label>
                                                                        <select value={item.icon || 'Star'} onChange={e => updateArrayItem(idx, 'icon', e.target.value)} className="w-full text-sm p-2 border rounded">
                                                                            <option value="Star">Star</option>
                                                                            <option value="Globe">Globe</option>
                                                                            <option value="ShieldCheck">Shield Check</option>
                                                                            <option value="Leaf">Leaf (Eco)</option>
                                                                            <option value="Truck">Truck</option>
                                                                            <option value="Zap">Lightning</option>
                                                                            <option value="Award">Award</option>
                                                                            <option value="CheckCircle">Check Mark</option>
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Title</label>
                                                                        <input type="text" value={item.title} onChange={e => updateArrayItem(idx, 'title', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Description Content</label>
                                                                    <textarea value={item.description} onChange={e => updateArrayItem(idx, 'description', e.target.value)} className="w-full text-sm p-2 border rounded" rows={3} />
                                                                </div>
                                                            </>
                                                        )}

                                                        {editingSection === 'stats_counter' && (
                                                            <>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Digit</label>
                                                                        <input type="number" value={item.number || 0} onChange={e => updateArrayItem(idx, 'number', parseInt(e.target.value) || 0)} className="w-full text-sm p-2 border rounded font-mono" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Suffix (M+, %)</label>
                                                                        <input type="text" value={item.suffix || ''} onChange={e => updateArrayItem(idx, 'suffix', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Icon</label>
                                                                        <select value={item.icon} onChange={e => updateArrayItem(idx, 'icon', e.target.value)} className="w-full text-sm p-2.5 border rounded">
                                                                            <option value="Users">Users</option>
                                                                            <option value="Factory">Factory</option>
                                                                            <option value="Globe2">Globe</option>
                                                                            <option value="Activity">Activity</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Descriptive Label</label>
                                                                    <input type="text" value={item.label || ''} onChange={e => updateArrayItem(idx, 'label', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                </div>
                                                            </>
                                                        )}

                                                        {editingSection === 'certifications' && (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Certification Org</label>
                                                                        <input type="text" value={item.name || ''} onChange={e => updateArrayItem(idx, 'name', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">External Source Link (Opt)</label>
                                                                        <input type="text" value={item.link || ''} onChange={e => updateArrayItem(idx, 'link', e.target.value)} className="w-full text-sm p-2 border rounded font-mono" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Logo Asset (Transparent PNG)</label>
                                                                    <div className="h-24"><ImagePicker value={item.image || ''} onChange={url => updateArrayItem(idx, 'image', url)} /></div>
                                                                </div>
                                                            </>
                                                        )}

                                                        {editingSection === 'testimonials' && (
                                                            <>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Client Avatar</label>
                                                                    <div className="h-24"><ImagePicker value={item.avatar || ''} onChange={url => updateArrayItem(idx, 'avatar', url)} /></div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                                                                        <input type="text" value={item.name || ''} onChange={e => updateArrayItem(idx, 'name', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Company</label>
                                                                        <input type="text" value={item.company || ''} onChange={e => updateArrayItem(idx, 'company', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Country Iso</label>
                                                                        <input type="text" value={item.country || ''} onChange={e => updateArrayItem(idx, 'country', e.target.value)} className="w-full text-sm p-2 border rounded" />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Body Quote</label>
                                                                    <textarea value={item.quote || ''} onChange={e => updateArrayItem(idx, 'quote', e.target.value)} className="w-full text-sm p-2 border rounded" rows={3} />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    const baseObj =
                                                        editingSection === 'hero_slider' ? { title: 'New Slide', subtitle: '', image: '', ctaText: '', ctaLink: '' } :
                                                            editingSection === 'why_choose_us' ? { title: 'New Feature', description: '', icon: 'Star' } :
                                                                editingSection === 'stats_counter' ? { label: 'Metric', number: 0, suffix: '+', icon: 'Users' } :
                                                                    editingSection === 'certifications' ? { name: 'ISO', image: '', link: '' } :
                                                                        editingSection === 'testimonials' ? { name: 'John Doe', avatar: '', company: 'Acme', country: 'US', quote: '' } : {};
                                                    addToArray(baseObj);
                                                }}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/20"
                                            >
                                                <Plus size={18} /> Append New Block
                                            </button>
                                        </div>
                                    )}

                                    {/* DB Feeds Instructions */}
                                    {(editingSection === 'category_grid' || editingSection === 'featured_products') && (
                                        <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed rounded-xl bg-gray-50 dark:bg-dark-bg mt-4">
                                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                                <Icons.Database size={32} />
                                            </div>
                                            <h4 className="font-bold text-xl mb-2">Automated Data Feed</h4>
                                            <p className="text-gray-500 text-sm max-w-sm">
                                                This section is populated live from your Prisma Database API.
                                                <br /><br />
                                                To edit what appears here, simply assign Products to the "Featured" tag in the Products manager.
                                            </p>
                                        </div>
                                    )}

                                </div>
                                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-between gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                                    {(editingSection === 'category_grid' || editingSection === 'featured_products') ? (
                                        <button onClick={() => setEditingSection(null)} className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition flex items-center justify-center gap-2">✓ Configured via DB</button>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditingSection(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">Discard</button>
                                            <button
                                                onClick={saveEditor}
                                                disabled={saving}
                                                className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition flex flex-1 items-center justify-center gap-2"
                                            >
                                                <Save size={18} /> {saving ? 'Writing...' : 'Push to Live Website'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center p-10 bg-gray-50/50 dark:bg-dark-surface/50">
                                <LayoutDashboard className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="font-bold text-gray-400 text-xl">Select a section to configure</h3>
                                <p className="text-gray-400 text-sm mt-2 max-w-xs">Click the Edit icon <Edit2 size={12} className="inline mx-1" /> on any block in the hierarchy list to load its JSON parameter payload.</p>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
