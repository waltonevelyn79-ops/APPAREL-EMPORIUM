'use client';

import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', company: '', phone: '', country: '', message: '', productInterest: ''
    });

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to send message');

            setSuccess(true);
            setFormData({ name: '', email: '', company: '', phone: '', country: '', message: '', productInterest: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-6xl">

                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Let's discuss your sourcing requirements. We're here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-12 bg-white dark:bg-dark-surface rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800">

                    {/* Contact Form */}
                    <div className="md:col-span-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Send an Inquiry</h2>

                        {success && (
                            <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Thank you! Your message has been sent successfully. We will get back to you shortly.
                            </div>
                        )}

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                                    <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                                    <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                                    <input name="company" value={formData.company} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Country</label>
                                    <input name="country" value={formData.country} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Interest</label>
                                <select name="productInterest" value={formData.productInterest} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white">
                                    <option value="">Select a category...</option>
                                    <option value="Men's Fashion">Men's Fashion</option>
                                    <option value="Women's Fashion">Women's Fashion</option>
                                    <option value="Children's Fashion">Children's Fashion</option>
                                    <option value="Home Textiles">Home Textiles</option>
                                    <option value="Footwear">Footwear</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message details (Tech pack, MOQ, etc) *</label>
                                <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary outline-none transition-all resize-none dark:text-white"></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Send Inquiry</>}
                            </button>
                        </form>
                    </div>

                    {/* Contact Details */}
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Get In Touch</h2>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-gray-600 text-primary">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Headquarters</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">House # 09, Road # 03<br />Sector # 05, Uttara<br />Dhaka-1230, Bangladesh</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-gray-600 text-primary">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Phone & WhatsApp</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm block mb-1">+880 1811 422225</p>
                                        <a href="https://wa.me/8801811422225" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 dark:text-green-500 hover:underline">Chat on WhatsApp</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-gray-600 text-primary">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Email</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">kamal@aelbd.net</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-wider">Business Hours</h4>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                <li className="flex justify-between"><span>Sunday - Thursday:</span> <span className="font-medium text-gray-900 dark:text-white">9:00 AM - 6:00 PM (GMT+6)</span></li>
                                <li className="flex justify-between"><span>Friday - Saturday:</span> <span className="font-medium text-gray-900 dark:text-white">Closed</span></li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
