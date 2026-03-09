'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle, Send, AlertCircle } from 'lucide-react';

interface Field {
    id: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string;
}

interface FormRendererProps {
    slug: string;
    className?: string;
}

export default function FormRenderer({ slug, className = "" }: FormRendererProps) {
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<Record<string, any>>({});

    React.useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/forms/public?slug=${slug}`);
                const data = await res.json();
                if (data.success) {
                    setForm(data.form);
                    // Initialize form data
                    const initialData: Record<string, any> = {};
                    const fields = typeof data.form.fields === 'string' ? JSON.parse(data.form.fields) : data.form.fields;
                    fields.forEach((f: Field) => {
                        initialData[f.label] = f.type === 'checkbox' ? [] : '';
                    });
                    setFormData(initialData);
                } else {
                    setError('Form not found');
                }
            } catch (err) {
                setError('Failed to load form');
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [slug]);

    const handleChange = (label: string, value: any) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    };

    const handleCheckboxChange = (label: string, option: string, checked: boolean) => {
        const current = formData[label] || [];
        if (checked) {
            handleChange(label, [...current, option]);
        } else {
            handleChange(label, current.filter((o: string) => o !== option));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: form.id,
                    data: formData
                })
            });

            const result = await res.json();
            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.error || 'Failed to submit form');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
    if (error) return <div className="p-4 bg-red-50 text-red-500 rounded-lg flex items-center gap-2"><AlertCircle size={18} /> {error}</div>;
    if (submitted) return (
        <div className="text-center py-12 px-4 space-y-4 animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold">{form?.successMessage || 'Thank you!'}</h3>
            <p className="text-gray-500">Your submission has been received. We will get back to you soon.</p>
            <button
                onClick={() => setSubmitted(false)}
                className="text-primary font-bold hover:underline"
            >
                Send another response
            </button>
        </div>
    );

    const fields = typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields;

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {fields.map((field: Field) => (
                <div key={field.id} className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={e => handleChange(field.label, e.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all resize-none dark:text-white"
                        />
                    ) : field.type === 'select' ? (
                        <select
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={e => handleChange(field.label, e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        >
                            <option value="">{field.placeholder || 'Select an option'}</option>
                            {field.options?.split(',').map(opt => (
                                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                            ))}
                        </select>
                    ) : field.type === 'radio' ? (
                        <div className="space-y-2 pt-1">
                            {field.options?.split(',').map(opt => (
                                <label key={opt.trim()} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name={field.id}
                                        required={field.required}
                                        checked={formData[field.label] === opt.trim()}
                                        onChange={() => handleChange(field.label, opt.trim())}
                                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{opt.trim()}</span>
                                </label>
                            ))}
                        </div>
                    ) : field.type === 'checkbox' ? (
                        <div className="space-y-2 pt-1">
                            {field.options?.split(',').map(opt => (
                                <label key={opt.trim()} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={(formData[field.label] || []).includes(opt.trim())}
                                        onChange={e => handleCheckboxChange(field.label, opt.trim(), e.target.checked)}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{opt.trim()}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <input
                            type={field.type}
                            required={field.required}
                            value={formData[field.label] || ''}
                            onChange={e => handleChange(field.label, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        />
                    )}
                </div>
            ))}

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Submit Request</>}
            </button>
        </form>
    );
}

