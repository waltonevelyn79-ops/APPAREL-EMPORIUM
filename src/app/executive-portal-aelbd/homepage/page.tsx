'use client';

import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import {
    Eye, EyeOff, Edit2, GripVertical, Plus, Trash2, X, Save,
    LayoutDashboard, Type, ChevronDown, ChevronRight
} from 'lucide-react';
import * as Icons from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';

type SectionID =
    | 'announcement_bar' | 'hero_slider' | 'stats_counter'
    | 'category_grid' | 'featured_products' | 'why_choose_us'
    | 'certifications' | 'testimonials' | 'cta_section';

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

/* ─────────────────────────────────────────────────────────────
   HEADING FIELDS — every editable label per section
───────────────────────────────────────────────────────────── */
interface HeadingField { key: string; label: string; placeholder: string; hint?: string }

const HEADING_FIELDS: HeadingField[] = [
    // Certifications
    { key: 'certifications_label', label: 'Certifications — Section Label', placeholder: 'Certified By Leading Global Standards', hint: 'Small uppercase label above the logo marquee.' },
    // Why Choose Us
    { key: 'why_choose_us_eyebrow', label: 'Why Choose Us — Eyebrow Tag', placeholder: 'Corporate Advantage', hint: 'Small coloured tag above the heading.' },
    { key: 'why_choose_us_heading', label: 'Why Choose Us — Main Heading', placeholder: 'Why Partner With Us' },
    { key: 'why_choose_us_subheading', label: 'Why Choose Us — Subheading Paragraph', placeholder: 'Leading global sourcing and manufacturing excellence…', hint: 'One-line description below the heading.' },
    // Category Grid
    { key: 'category_grid_eyebrow', label: 'Shop By Category — Eyebrow Tag', placeholder: 'Premium Collections' },
    { key: 'category_grid_heading', label: 'Shop By Category — Section Heading', placeholder: 'Shop By Category' },
    // Featured Products
    { key: 'featured_products_eyebrow', label: 'Featured Products — Eyebrow Tag', placeholder: 'Premium Quality', hint: 'Appears next to the star icon above the heading.' },
    { key: 'featured_products_heading', label: 'Featured Products — Section Heading', placeholder: 'Featured Products' },
];

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function HomepageBuilderPage() {
    const { role } = usePermission();

    const [activeTab, setActiveTab] = useState<'layout' | 'headings'>('layout');

    const [order, setOrder] = useState<SectionID[]>(DEFAULT_ORDER);
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const [settingsData, setSettingsData] = useState<Record<string, string>>({});

    // Section headings (labels/titles for every section)
    const [headings, setHeadings] = useState<Record<string, string>>({});
    const [headingsSaving, setHeadingsSaving] = useState(false);
    const [headingsSaved, setHeadingsSaved] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingSection, setEditingSection] = useState<SectionID | null>(null);
    const [editorData, setEditorData] = useState<any>(null);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings?group=homepage');
            const data = await res.json();
            if (data.settings) {
                const map = data.settings;
                setSettingsData(map);
                if (map['homepage_sections_order']) setOrder(JSON.parse(map['homepage_sections_order']));
                if (map['homepage_sections_visibility']) setVisibility(JSON.parse(map['homepage_sections_visibility']));
                if (map['homepage_section_headings']) setHeadings(JSON.parse(map['homepage_section_headings']));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const saveChanges = async (
        newOrder: SectionID[] = order,
        newVis: Record<string, boolean> = visibility,
        extraKey?: string,
        extraVal?: string
    ) => {
        setSaving(true);
        const payload: Record<string, string> = {
            homepage_sections_order: JSON.stringify(newOrder),
            homepage_sections_visibility: JSON.stringify(newVis)
        };
        if (extraKey && extraVal !== undefined) payload[extraKey] = extraVal;
        try {
            await Promise.all(
                Object.entries(payload).map(([k, v]) =>
                    fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k, value: v, group: 'homepage' }) })
                )
            );
            await fetch('/api/revalidate?path=/');
        } catch (e) { console.error('Save failed', e); }
        finally { setSaving(false); setEditingSection(null); }
    };

    const saveHeadings = async () => {
        setHeadingsSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'homepage_section_headings', value: JSON.stringify(headings), group: 'homepage' })
            });
            await fetch('/api/revalidate?path=/');
            setHeadingsSaved(true);
            setTimeout(() => setHeadingsSaved(false), 3000);
        } catch (e) { console.error(e); }
        finally { setHeadingsSaving(false); }
    };

    /* ── Drag & Drop ── */
    const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
    const handleDragStart = (e: React.DragEvent, idx: number) => { setDraggedIdx(idx); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => e.target instanceof HTMLElement && e.target.classList.add('opacity-50'), 0); };
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault(); if (draggedIdx === null || draggedIdx === idx) return;
        const newOrder = [...order]; const draggedItem = newOrder.splice(draggedIdx, 1)[0]; newOrder.splice(idx, 0, draggedItem);
        setOrder(newOrder); setDraggedIdx(idx);
    };
    const handleDrop = async (e: React.DragEvent) => { e.preventDefault(); e.target instanceof HTMLElement && e.target.classList.remove('opacity-50'); setDraggedIdx(null); await saveChanges(order, visibility); };
    const handleDragEnd = (e: React.DragEvent) => { e.target instanceof HTMLElement && e.target.classList.remove('opacity-50'); setDraggedIdx(null); };

    const toggleVisibility = async (id: SectionID) => {
        const newVis = { ...visibility, [id]: !(visibility[id] !== false) };
        setVisibility(newVis); await saveChanges(order, newVis);
    };

    const openEditor = (id: SectionID) => {
        let initialData: any = {};
        try { const raw = settingsData[`homepage_${id}`]; if (raw) initialData = JSON.parse(raw); } catch (e) { }
        if (!initialData || Object.keys(initialData).length === 0) {
            if (id === 'hero_slider') initialData = [];
            else if (id === 'stats_counter') initialData = [];
            else if (id === 'why_choose_us') initialData = [];
            else if (id === 'certifications') initialData = [];
            else if (id === 'testimonials') initialData = [];
            else if (id === 'cta_section') initialData = { heading: '', subheading: '', ctaText: '', ctaLink: '', image: '' };
            else if (id === 'announcement_bar') initialData = { text: '', link: '', bgColor: '#1B365D', textColor: '#ffffff' };
        }
        setEditorData(initialData); setEditingSection(id);
    };

    const updateEditorData = (field: string, val: any) => setEditorData({ ...editorData, [field]: val });
    const addToArray = (baseObj: any) => setEditorData([...editorData, { id: Date.now().toString(), ...baseObj }]);
    const updateArrayItem = (idx: number, field: string, val: any) => { const arr = [...editorData]; arr[idx][field] = val; setEditorData(arr); };
    const removeFromArray = (idx: number) => setEditorData(editorData.filter((_: any, i: number) => i !== idx));
    const saveEditor = async () => { if (!editingSection) return; await saveChanges(order, visibility, `homepage_${editingSection}`, JSON.stringify(editorData)); };

    if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3 font-heading">
                        <LayoutDashboard className="text-primary w-8 h-8" /> Homepage Builder
                    </h1>
                    <p className="text-gray-500 text-sm">Edit section order, visibility, titles and content — no code needed.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 font-mono text-xs items-center gap-2 px-3 shadow-inner">
                    <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                    {saving ? 'Syncing...' : 'Auto-Sync Live'}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1 w-fit">
                <button onClick={() => setActiveTab('layout')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'layout' ? 'bg-white dark:bg-gray-900 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <GripVertical size={16} /> Section Layout & Content
                </button>
                <button onClick={() => setActiveTab('headings')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'headings' ? 'bg-white dark:bg-gray-900 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <Type size={16} /> Section Titles & Labels
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div></div>
            ) : activeTab === 'layout' ? (

                /* ════════════════════════════════════════════════
                   TAB 1: SECTION LAYOUT & CONTENT EDITOR
                ════════════════════════════════════════════════ */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Draggable List */}
                    <div className="lg:col-span-5 space-y-4 bg-gray-50/50 dark:bg-gray-900/10 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><GripVertical className="text-gray-400" /> Section Hierarchy</h3>

                        {/* Announcement Bar */}
                        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-dark-surface/60 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl shadow-sm mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-gray-300 pointer-events-none"><GripVertical size={20} /></div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">Announcement Bar</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleVisibility('announcement_bar')}
                                    className={`p-2 rounded-md transition ${visibility['announcement_bar'] !== false ? 'text-green-500 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                    {visibility['announcement_bar'] !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button onClick={() => openEditor('announcement_bar')} className="p-2 text-primary hover:bg-primary/10 rounded-md transition border border-primary/20">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Draggable Sections */}
                        <div className="space-y-4">
                            {order.map((sectionId, idx) => {
                                const isVisible = visibility[sectionId] !== false;
                                return (
                                    <div key={sectionId} draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={handleDrop}
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center justify-between p-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-move group ${!isVisible ? 'opacity-60 saturate-50' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="text-gray-400 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                                                <GripVertical size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{SECTION_NAMES[sectionId]}</p>
                                                <p className="text-xs text-gray-400 font-mono">{sectionId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleVisibility(sectionId)}
                                                className={`p-2 rounded-md transition ${isVisible ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}>
                                                {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button onClick={() => openEditor(sectionId)} className="p-2 text-primary hover:bg-primary/10 rounded-md transition border border-primary/20">
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
                            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-primary/20 overflow-hidden sticky top-24 animate-in fade-in slide-in-from-right-8 duration-300">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
                                        <div className="w-2 h-6 bg-primary rounded-full"></div>
                                        Edit {SECTION_NAMES[editingSection]}
                                    </h3>
                                    <button onClick={() => setEditingSection(null)} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg transition"><X size={20} /></button>
                                </div>

                                <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                    {/* ANNOUNCEMENT BAR */}
                                    {editingSection === 'announcement_bar' && (
                                        <div className="space-y-5">
                                            <FieldLabel>Announcement Text</FieldLabel>
                                            <input type="text" value={editorData.text || ''} onChange={e => updateEditorData('text', e.target.value)} className="w-full px-4 py-2 border dark:border-gray-700 bg-gray-50 dark:bg-dark-bg rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Free shipping worldwide..." />
                                            <FieldLabel>Redirect URL</FieldLabel>
                                            <input type="text" value={editorData.link || ''} onChange={e => updateEditorData('link', e.target.value)} className="w-full px-4 py-2 border dark:border-gray-700 bg-gray-50 dark:bg-dark-bg rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary outline-none" placeholder="/sale" />
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <FieldLabel>BG Color</FieldLabel>
                                                    <div className="flex gap-2"><input type="color" value={editorData.bgColor || '#1B365D'} onChange={e => updateEditorData('bgColor', e.target.value)} className="w-10 h-10 p-0.5 border rounded cursor-pointer" /><input type="text" value={editorData.bgColor || '#1B365D'} onChange={e => updateEditorData('bgColor', e.target.value)} className="w-full px-3 border rounded text-sm font-mono" /></div>
                                                </div>
                                                <div>
                                                    <FieldLabel>Text Color</FieldLabel>
                                                    <div className="flex gap-2"><input type="color" value={editorData.textColor || '#FFFFFF'} onChange={e => updateEditorData('textColor', e.target.value)} className="w-10 h-10 p-0.5 border rounded cursor-pointer" /><input type="text" value={editorData.textColor || '#FFFFFF'} onChange={e => updateEditorData('textColor', e.target.value)} className="w-full px-3 border rounded text-sm font-mono" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CTA SECTION */}
                                    {editingSection === 'cta_section' && (
                                        <div className="space-y-5">
                                            <FieldLabel>Headline</FieldLabel>
                                            <input type="text" value={editorData.heading || ''} onChange={e => updateEditorData('heading', e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm font-bold bg-white dark:bg-dark-bg" />
                                            <FieldLabel>Subheading Description</FieldLabel>
                                            <textarea value={editorData.subheading || ''} onChange={e => updateEditorData('subheading', e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-dark-bg" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><FieldLabel>Button Text</FieldLabel><input type="text" value={editorData.ctaText || ''} onChange={e => updateEditorData('ctaText', e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-dark-bg" /></div>
                                                <div><FieldLabel>Button URL</FieldLabel><input type="text" value={editorData.ctaLink || ''} onChange={e => updateEditorData('ctaLink', e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm font-mono bg-white dark:bg-dark-bg" /></div>
                                            </div>
                                            <FieldLabel>Background Image</FieldLabel>
                                            <ImagePicker value={editorData.image || ''} onChange={url => updateEditorData('image', url)} />
                                        </div>
                                    )}

                                    {/* ARRAY-BASED SECTIONS */}
                                    {Array.isArray(editorData) && editingSection !== 'category_grid' && editingSection !== 'featured_products' && (
                                        <div className="space-y-8">
                                            {editorData.map((item: any, idx: number) => (
                                                <div key={item.id || idx} className="bg-gray-50 dark:bg-gray-800/20 p-5 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
                                                    <button onClick={() => removeFromArray(idx)} className="absolute top-3 right-3 p-1.5 bg-white text-red-500 border border-red-200 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"><Trash2 size={16} /></button>
                                                    <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center justify-center text-xs font-bold font-mono">{idx + 1}</div>
                                                    <div className="grid grid-cols-1 gap-4 pt-8">

                                                        {editingSection === 'hero_slider' && (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div><FieldLabel>Slide Headline</FieldLabel><input type="text" value={item.title} onChange={e => updateArrayItem(idx, 'title', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                    <div><FieldLabel>Subtitle</FieldLabel><textarea value={item.subtitle} onChange={e => updateArrayItem(idx, 'subtitle', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" rows={2} /></div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div><FieldLabel>Button Text</FieldLabel><input type="text" value={item.ctaText} onChange={e => updateArrayItem(idx, 'ctaText', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                    <div><FieldLabel>Button Link</FieldLabel><input type="text" value={item.ctaLink} onChange={e => updateArrayItem(idx, 'ctaLink', e.target.value)} className="w-full text-sm p-2 border rounded font-mono" /></div>
                                                                </div>
                                                                <FieldLabel>Slide Background Image</FieldLabel>
                                                                <ImagePicker value={item.image || ''} onChange={url => updateArrayItem(idx, 'image', url)} />
                                                            </>
                                                        )}

                                                        {editingSection === 'stats_counter' && (
                                                            <>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div><FieldLabel>Number</FieldLabel><input type="number" value={item.number || 0} onChange={e => updateArrayItem(idx, 'number', parseInt(e.target.value) || 0)} className="w-full text-sm p-2 border rounded font-mono" /></div>
                                                                    <div><FieldLabel>Suffix (M+, %)</FieldLabel><input type="text" value={item.suffix || ''} onChange={e => updateArrayItem(idx, 'suffix', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                    <div><FieldLabel>Icon</FieldLabel>
                                                                        <select value={item.icon} onChange={e => updateArrayItem(idx, 'icon', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                                                                            <option value="Users">Users</option>
                                                                            <option value="Factory">Factory</option>
                                                                            <option value="Globe2">Globe</option>
                                                                            <option value="Activity">Activity</option>
                                                                            <option value="Star">Star</option>
                                                                            <option value="Award">Award</option>
                                                                            <option value="TrendingUp">Trending Up</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <FieldLabel>Descriptive Label</FieldLabel>
                                                                <input type="text" value={item.label || ''} onChange={e => updateArrayItem(idx, 'label', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" placeholder="e.g. Global Buyers" />
                                                            </>
                                                        )}

                                                        {editingSection === 'why_choose_us' && (
                                                            <>
                                                                <div className="grid grid-cols-[1fr_3fr] gap-4">
                                                                    <div>
                                                                        <FieldLabel>Lucide Icon</FieldLabel>
                                                                        <select value={item.icon || 'Star'} onChange={e => updateArrayItem(idx, 'icon', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none">
                                                                            {['Star', 'Globe', 'ShieldCheck', 'Leaf', 'Truck', 'Zap', 'Award', 'CheckCircle', 'Clock', 'Heart', 'Package', 'Recycle'].map(i => <option key={i} value={i}>{i}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div><FieldLabel>Title</FieldLabel><input type="text" value={item.title} onChange={e => updateArrayItem(idx, 'title', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                </div>
                                                                <FieldLabel>Description</FieldLabel>
                                                                <textarea value={item.description} onChange={e => updateArrayItem(idx, 'description', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" rows={3} />
                                                            </>
                                                        )}

                                                        {editingSection === 'certifications' && (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div><FieldLabel>Certification Name</FieldLabel><input type="text" value={item.name || ''} onChange={e => updateArrayItem(idx, 'name', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                    <div><FieldLabel>External Link (optional)</FieldLabel><input type="text" value={item.link || ''} onChange={e => updateArrayItem(idx, 'link', e.target.value)} className="w-full text-sm p-2 border rounded font-mono" /></div>
                                                                </div>
                                                                <FieldLabel>Logo Asset (Transparent PNG)</FieldLabel>
                                                                <div className="h-24"><ImagePicker value={item.image || ''} onChange={url => updateArrayItem(idx, 'image', url)} /></div>
                                                            </>
                                                        )}

                                                        {editingSection === 'testimonials' && (
                                                            <>
                                                                <FieldLabel>Client Avatar</FieldLabel>
                                                                <div className="h-24"><ImagePicker value={item.avatar || ''} onChange={url => updateArrayItem(idx, 'avatar', url)} /></div>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div><FieldLabel>Name</FieldLabel><input type="text" value={item.name || ''} onChange={e => updateArrayItem(idx, 'name', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                    <div><FieldLabel>Company</FieldLabel><input type="text" value={item.company || ''} onChange={e => updateArrayItem(idx, 'company', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                    <div><FieldLabel>Country</FieldLabel><input type="text" value={item.country || ''} onChange={e => updateArrayItem(idx, 'country', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" /></div>
                                                                </div>
                                                                <FieldLabel>Quote</FieldLabel>
                                                                <textarea value={item.quote || ''} onChange={e => updateArrayItem(idx, 'quote', e.target.value)} className="w-full text-sm p-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 outline-none" rows={3} />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button onClick={() => {
                                                const baseObj =
                                                    editingSection === 'hero_slider' ? { title: 'New Slide', subtitle: '', image: '', ctaText: '', ctaLink: '' } :
                                                        editingSection === 'why_choose_us' ? { title: 'New Feature', description: '', icon: 'Star' } :
                                                            editingSection === 'stats_counter' ? { label: 'Metric', number: 0, suffix: '+', icon: 'Users' } :
                                                                editingSection === 'certifications' ? { name: 'ISO', image: '', link: '' } :
                                                                    editingSection === 'testimonials' ? { name: 'John Doe', avatar: '', company: 'Acme', country: 'US', quote: '' } : {};
                                                addToArray(baseObj);
                                            }} className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/20">
                                                <Plus size={18} /> Append New Block
                                            </button>
                                        </div>
                                    )}

                                    {/* DB-fed sections */}
                                    {(editingSection === 'category_grid' || editingSection === 'featured_products') && (
                                        <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed rounded-xl bg-gray-50 dark:bg-dark-bg mt-4">
                                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                                <Icons.Database size={32} />
                                            </div>
                                            <h4 className="font-bold text-xl mb-2">Automated Data Feed</h4>
                                            <p className="text-gray-500 text-sm max-w-sm">
                                                This section is populated live from your database.<br /><br />
                                                To edit what appears here, go to <strong>Products</strong> and mark them as Featured. To change the section heading and eyebrow label, use the <strong>Section Titles & Labels</strong> tab.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex justify-between gap-3">
                                    {(editingSection === 'category_grid' || editingSection === 'featured_products') ? (
                                        <button onClick={() => setEditingSection(null)} className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition">✓ OK, Got It</button>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditingSection(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">Discard</button>
                                            <button onClick={saveEditor} disabled={saving}
                                                className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-primary/90 transition flex flex-1 items-center justify-center gap-2">
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
                                <p className="text-gray-400 text-sm mt-2 max-w-xs">Click the <Edit2 size={12} className="inline mx-1" /> icon on any block in the hierarchy list.</p>
                            </div>
                        )}
                    </div>
                </div>

            ) : (

                /* ════════════════════════════════════════════════
                   TAB 2: SECTION TITLES & LABELS
                ════════════════════════════════════════════════ */
                <div className="max-w-3xl">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 text-sm text-blue-700 dark:text-blue-300">
                        <strong>How it works:</strong> These labels and headings are shown on the live homepage. Leave a field blank to keep the default text. Changes will appear immediately when you click <strong>Save All Headings</strong>.
                    </div>

                    <div className="space-y-4">
                        {/* Group by section */}
                        {[
                            { section: 'Certifications / Logo Marquee', keys: ['certifications_label'] },
                            { section: 'Why Choose Us / Partner Features', keys: ['why_choose_us_eyebrow', 'why_choose_us_heading', 'why_choose_us_subheading'] },
                            { section: 'Shop By Category', keys: ['category_grid_eyebrow', 'category_grid_heading'] },
                            { section: 'Featured Products', keys: ['featured_products_eyebrow', 'featured_products_heading'] },
                        ].map(group => (
                            <HeadingGroup key={group.section} title={group.section}>
                                {HEADING_FIELDS.filter(f => group.keys.includes(f.key)).map(field => (
                                    <div key={field.key} className="mb-4 last:mb-0">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                                        {field.hint && <p className="text-xs text-gray-400 mb-1.5">{field.hint}</p>}
                                        <input
                                            type="text"
                                            value={headings[field.key] || ''}
                                            onChange={e => setHeadings(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-dark-bg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1 font-mono">Default: &ldquo;{field.placeholder}&rdquo;</p>
                                    </div>
                                ))}
                            </HeadingGroup>
                        ))}
                    </div>

                    {/* Stats Counter note */}
                    <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
                        <strong>📊 Stats Counter (20+ Years, 500+ Buyers, etc.)</strong><br />
                        These numbers and labels are managed individually in the <button onClick={() => { setActiveTab('layout'); openEditor('stats_counter'); }} className="underline font-bold">Section Layout → Stats Counter editor</button>. Each stat has its own Number, Suffix, Icon and Label field.
                    </div>

                    {/* Save */}
                    <div className="sticky bottom-4 mt-8">
                        <div className="flex items-center justify-between bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl px-6 py-4">
                            <div className="text-sm text-gray-500">
                                {headingsSaved ? <span className="text-green-600 font-bold flex items-center gap-2">✅ Saved & published to live site!</span> : 'Changes are not saved until you click Save.'}
                            </div>
                            <button onClick={saveHeadings} disabled={headingsSaving}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition disabled:opacity-60">
                                {headingsSaving ? <Icons.Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {headingsSaving ? 'Saving...' : 'Save All Headings'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Sub-components ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{children}</label>;
}

function HeadingGroup({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(true);
    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <span className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                    {title}
                </span>
                {open ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </button>
            {open && <div className="px-6 pb-6 pt-1 border-t border-gray-100 dark:border-gray-800">{children}</div>}
        </div>
    );
}
