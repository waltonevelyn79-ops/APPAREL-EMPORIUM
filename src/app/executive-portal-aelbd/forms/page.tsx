'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2, GripVertical, Settings, Save, ArrowLeft } from 'lucide-react';

export default function FormsPage() {
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('LIST'); // LIST, BUILDER
    const [currentForm, setCurrentForm] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchForms();
    }, [view]);

    const fetchForms = async () => {
        try {
            const res = await fetch('/api/forms');
            const data = await res.json();
            if (data.success) {
                setForms(data.forms);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setCurrentForm({
            id: '',
            name: '',
            slug: '',
            submitEmail: '',
            successMessage: 'Thank you for your submission!',
            isActive: true,
            fields: []
        });
        setView('BUILDER');
    };

    const handleEdit = (form: any) => {
        setCurrentForm({
            ...form,
            fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields
        });
        setView('BUILDER');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form and ALL its submissions?')) return;
        try {
            const res = await fetch(`/api/forms?id=${id}`, { method: 'DELETE' });
            if ((await res.json()).success) {
                setForms(forms.filter(f => f.id !== id));
            }
        } catch (e) {
            alert('Delete failed');
        }
    };

    const saveForm = async () => {
        setSaving(true);
        setError('');

        if (!currentForm.name || !currentForm.slug || currentForm.fields.length === 0) {
            setError('Name, slug, and at least one field are required.');
            setSaving(false);
            return;
        }

        try {
            const method = currentForm.id ? 'PUT' : 'POST';
            const res = await fetch('/api/forms', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentForm)
            });
            const data = await res.json();

            if (data.success) {
                setView('LIST');
            } else {
                setError(data.error || 'Failed to save form');
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const addField = () => {
        setCurrentForm({
            ...currentForm,
            fields: [...currentForm.fields, { id: Date.now().toString(), label: 'New Field', type: 'text', required: false, placeholder: '', options: '' }]
        });
    };

    const updateField = (id: string, key: string, value: any) => {
        setCurrentForm({
            ...currentForm,
            fields: currentForm.fields.map((f: any) => f.id === id ? { ...f, [key]: value } : f)
        });
    };

    const deleteField = (id: string) => {
        setCurrentForm({
            ...currentForm,
            fields: currentForm.fields.filter((f: any) => f.id !== id)
        });
    };

    const moveField = (index: number, direction: 'UP' | 'DOWN') => {
        if (direction === 'UP' && index === 0) return;
        if (direction === 'DOWN' && index === currentForm.fields.length - 1) return;

        const newFields = [...currentForm.fields];
        const swapIndex = direction === 'UP' ? index - 1 : index + 1;
        const temp = newFields[index];
        newFields[index] = newFields[swapIndex];
        newFields[swapIndex] = temp;

        setCurrentForm({ ...currentForm, fields: newFields });
    };

    const generateSlug = (val: string) => {
        if (!currentForm.id) {
            setCurrentForm({ ...currentForm, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
        } else {
            setCurrentForm({ ...currentForm, name: val });
        }
    };

    if (loading && view === 'LIST') return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    if (view === 'BUILDER' && currentForm) {
        return (
            <div className="max-w-6xl pb-12 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('LIST')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-500" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentForm.id ? 'Edit Form' : 'Create New Form'}</h1>
                    </div>
                    <button onClick={saveForm} disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl transition-all shadow-md font-bold flex items-center gap-2">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Form
                    </button>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200">{error}</div>}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Settings Panel */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3"><Settings className="w-5 h-5 text-primary" /> General Settings</h2>

                            <div className="space-y-4 text-sm font-semibold">
                                <div>
                                    <label className="block mb-1.5">Form Name</label>
                                    <input type="text" value={currentForm.name} onChange={e => generateSlug(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none" placeholder="e.g. Contact Us" />
                                </div>
                                <div>
                                    <label className="block mb-1.5">Slug (Auto-Generated)</label>
                                    <input type="text" value={currentForm.slug} onChange={e => setCurrentForm({ ...currentForm, slug: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none block" />
                                </div>
                                <div>
                                    <label className="block mb-1.5">Notification Email</label>
                                    <input type="email" value={currentForm.submitEmail} onChange={e => setCurrentForm({ ...currentForm, submitEmail: e.target.value })} placeholder="admin@example.com (Optional)" className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none" />
                                </div>
                                <div>
                                    <label className="block mb-1.5">Success Message</label>
                                    <textarea rows={3} value={currentForm.successMessage} onChange={e => setCurrentForm({ ...currentForm, successMessage: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none resize-none" />
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer mt-4">
                                    <input type="checkbox" checked={currentForm.isActive} onChange={e => setCurrentForm({ ...currentForm, isActive: e.target.checked })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                    <span className="ml-3 font-semibold text-gray-900 dark:text-gray-300">Form Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Builder Panel */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Form Fields</h2>
                            <button onClick={addField} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm">
                                <Plus className="w-4 h-4" /> Add Field
                            </button>
                        </div>

                        {currentForm.fields.map((field: any, index: number) => (
                            <div key={field.id} className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex gap-4 items-start group">
                                <div className="flex flex-col items-center gap-1 text-gray-300 dark:text-gray-600 pt-2 cursor-grab active:cursor-grabbing hover:text-primary">
                                    <button onClick={() => moveField(index, 'UP')} disabled={index === 0}>▴</button>
                                    <GripVertical className="w-5 h-5" />
                                    <button onClick={() => moveField(index, 'DOWN')} disabled={index === currentForm.fields.length - 1}>▾</button>
                                </div>
                                <div className="flex-1 space-y-4 text-sm font-medium">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1">Field Label</label>
                                            <input type="text" value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block mb-1">Field Type</label>
                                            <select value={field.type} onChange={e => updateField(field.id, 'type', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none">
                                                <option value="text">Text (Short)</option>
                                                <option value="email">Email</option>
                                                <option value="phone">Phone Number</option>
                                                <option value="number">Number</option>
                                                <option value="textarea">Textarea (Long)</option>
                                                <option value="select">Select Dropdown</option>
                                                <option value="radio">Radio Buttons</option>
                                                <option value="checkbox">Checkbox Group</option>
                                                <option value="file">File Upload</option>
                                                <option value="country">Country Dropdown</option>
                                            </select>
                                        </div>
                                    </div>

                                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                                        <div>
                                            <label className="block mb-1">Options (Comma separated)</label>
                                            <input type="text" value={field.options} onChange={e => updateField(field.id, 'options', e.target.value)} placeholder="Option 1, Option 2, Option 3" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} className="w-4 h-4 text-primary rounded outline-none cursor-pointer" />
                                            Required Field
                                        </label>

                                        {!['file', 'country', 'radio', 'checkbox'].includes(field.type) && (
                                            <div className="flex-1 flex items-center gap-2">
                                                <label className="whitespace-nowrap">Placeholder:</label>
                                                <input type="text" value={field.placeholder || ''} onChange={e => updateField(field.id, 'placeholder', e.target.value)} className="flex-1 min-w-[100px] px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => deleteField(field.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Field">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        {currentForm.fields.length === 0 && (
                            <div className="text-center p-12 bg-white dark:bg-dark-surface rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                                <p className="mb-4">No fields added yet. Forms without fields cannot be saved.</p>
                                <button onClick={addField} className="px-4 py-2 bg-primary text-white font-bold rounded-lg shadow-md">+ Add First Field</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="max-w-6xl pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Custom Forms</h1>
                    <p className="text-gray-500 dark:text-gray-400">Build embeddable dynamic forms for inquiries, feedback, and more.</p>
                </div>
                <button onClick={handleCreateNew} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Create Form
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                            <th className="p-5 font-semibold">Form Name</th>
                            <th className="p-5 font-semibold">Slug (embed)</th>
                            <th className="p-5 font-semibold text-center">Submissions</th>
                            <th className="p-5 font-semibold">Status</th>
                            <th className="p-5 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 text-sm">
                        {forms.map((form: any) => (
                            <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-5 font-bold text-gray-900 dark:text-white">{form.name}</td>
                                <td className="p-5">
                                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-xs px-2 py-1 rounded">
                                        {'<Form slug="' + form.slug + '" />'}
                                    </span>
                                </td>
                                <td className="p-5 text-center font-bold text-primary">
                                    {form._count?.submissions || 0}
                                </td>
                                <td className="p-5">
                                    {form.isActive ? (
                                        <span className="flex items-center gap-1 text-green-600 font-medium text-xs"><CheckCircle className="w-4 h-4" /> Active</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-400 font-medium text-xs"><XCircle className="w-4 h-4" /> Disabled</span>
                                    )}
                                </td>
                                <td className="p-5 text-right space-x-2">
                                    <button onClick={() => handleEdit(form)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Form Builder">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(form.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg" title="Delete Form & Data">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {forms.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No forms built yet. Click 'Create Form' to start.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

