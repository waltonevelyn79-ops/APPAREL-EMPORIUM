'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle } from 'lucide-react';

const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Italy", "Spain", "Netherlands", "Sweden",
    "Bangladesh", "India", "China", "Vietnam", "Japan", "South Korea",
    "UAE", "Saudi Arabia", "Brazil", "Mexico", "Other"
];

function RequestQuoteContent() {
    const searchParams = useSearchParams();
    const productParam = searchParams.get('product') || '';

    const [formData, setFormData] = useState({
        productName: productParam,
        buyerName: '',
        buyerEmail: '',
        buyerCompany: '',
        buyerPhone: '',
        buyerCountry: '',
        quantity: '',
        targetPrice: '',
        deliveryDate: '',
        shippingTo: '',
        specialRequirements: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/rfq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to submit quote request');

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
                <div className="bg-white dark:bg-dark-surface max-w-lg w-full p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 font-heading">Quote Request Sent!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Thank you for your interest. Our sourcing experts will review your requirements and get back to you with a competitive quote within 24-48 hours.
                    </p>
                    <button
                        onClick={() => window.location.href = '/products'}
                        className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors shadow-md"
                    >
                        Browse More Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="py-20 bg-gray-50 dark:bg-dark-bg transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">B2B Sourcing</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-heading">
                        Request a Quote
                    </h1>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Please provide detailed information about your sourcing requirements. The more details you provide, the more accurate our quote will be.
                    </p>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 delay-100 border border-gray-100 dark:border-gray-800">
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary"></div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12">

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-8 text-sm font-medium border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            {/* Product Info Section */}
                            <div className="md:col-span-2 border-b border-gray-100 dark:border-gray-800 pb-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                                    Product Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name or Style Ref <span className="text-red-500">*</span></label>
                                        <input required type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. Men's Basic T-Shirt 100% Cotton" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantity Needed (Pieces) <span className="text-red-500">*</span></label>
                                        <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. 5000" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Price per Piece (Optional)</label>
                                        <input type="text" name="targetPrice" value={formData.targetPrice} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. $4.50" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info Section */}
                            <div className="md:col-span-2 border-b border-gray-100 dark:border-gray-800 pb-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                                    Buyer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
                                        <input required type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Work Email <span className="text-red-500">*</span></label>
                                        <input required type="email" name="buyerEmail" value={formData.buyerEmail} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                                        <input type="text" name="buyerCompany" value={formData.buyerCompany} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                        <select name="buyerCountry" value={formData.buyerCountry} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all">
                                            <option value="">Select Country</option>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Logistics info */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                                    Logistics & Requirements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Required Delivery Date</label>
                                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Shipping Destination Port</label>
                                        <input type="text" name="shippingTo" value={formData.shippingTo} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. New York, USA" />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Special Requirements & Specs</label>
                                    <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Fabric composition, GSM, printing techniques, packaging requirements, certifications needed..."></textarea>
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center gap-2 bg-primary text-white font-bold px-10 py-4 rounded-xl transition-all duration-300
                                ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90 hover:shadow-lg hover:-translate-y-1'}`}
                            >
                                {loading ? (
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                ) : (
                                    <><Send size={20} /> Submit Quote Request</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </main>
    );
}

export default function RequestQuotePage() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div></div>}>
            <RequestQuoteContent />
        </Suspense>
    );
}

