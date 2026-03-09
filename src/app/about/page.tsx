'use client';

import { Building2, Globe, Users, Trophy, Target, Eye, Heart, Calendar, CheckCircle2, Factory, Ship, ArrowRight } from 'lucide-react';
import Certifications from '@/components/home/Certifications';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';

export default function AboutPage() {
    const { settings } = useSettings();

    const stats = [
        { icon: <Building2 />, label: 'Years Excellence', val: settings.founded_year ? (new Date().getFullYear() - parseInt(settings.founded_year)) + '+' : '10+' },
        { icon: <Globe />, label: 'Countries Exported', val: '12+' },
        { icon: <Users />, label: 'Export Oriented', val: '100%' },
        { icon: <Trophy />, label: 'Client Retention', val: '98%' },
    ];

    const timeline = [
        { year: '2015', title: 'The Foundation', desc: 'Apparel Emporium was established in Dhaka with a vision to revolutionize garment sourcing.' },
        { year: '2017', title: 'Global Expansion', desc: 'Extended operations to North American and European markets (Canada, Sweden).' },
        { year: '2020', title: 'Digital Transformation', desc: 'Fully integrated ERP systems to manage supply chain transparency for buyers.' },
        { year: '2024', title: 'Sustainability Lead', desc: 'Partnering exclusively with LEED-certified factories for high-end fashion.' },
    ];

    return (
        <div className="bg-white dark:bg-dark-bg min-h-screen transition-colors duration-500">
            {/* Immersive Hero */}
            <div className="relative h-[70vh] flex items-center justify-center bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558223126-df82c61ce88d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay scale-110 animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900"></div>
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    <span className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md text-primary font-black rounded-full text-xs uppercase tracking-widest mb-6 animate-in slide-in-from-top-4">Our Heritage</span>
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none animate-in slide-in-from-bottom-6">
                        Bridging Excellence <br /> <span className="text-secondary italic">from Bangladesh</span> to the World
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed opacity-90">
                        {settings.company_tagline || '100% Export Oriented Readymade Garments, Home Textiles, Footwear and Accessories Buying House.'}
                    </p>
                </div>
            </div>

            {/* Our Story & Identity */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-dark-surface rotate-2 hover:rotate-0 transition-transform duration-700">
                                <img src="https://images.unsplash.com/photo-1524169358666-79f22534bc6e?q=80&w=2070&auto=format&fit=crop" alt="Production facility" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                            </div>
                            <div className="absolute bottom-6 left-6 bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-800 -rotate-2">
                                <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/20">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400">Awarded</p>
                                    <p className="font-bold text-gray-900 dark:text-white">Best Buying House 2023</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Crafting a Legacy in <span className="text-primary italic underline decoration-secondary">Manufacturing</span></h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                <p>
                                    {settings.about_story_p1 || "Spending many years in the field of readymade garments, home textiles, footwear and accessories we, highly experienced professional team understand and realize the problems which most of the overseas buyers are facing today and to provide the right solutions we formed Apparel Emporium, Trading Company in 2015."}
                                </p>
                                <p>
                                    {settings.about_story_p2 || "As a trusted and reliable Trading Company we source overseas Buyers/Importers to deal with merchandise as on their requirements from query to ship-out through our experienced professionals and trade associates."}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <CheckCircle2 size={20} /> Verified Factories
                                </div>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <CheckCircle2 size={20} /> Global Logistics
                                </div>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                    <CheckCircle2 size={20} /> QC Management
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategic Core (Mission/Vision) */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800/30">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="group bg-white dark:bg-dark-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all">
                                <Target size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Our Mission</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                To source leading manufacturers and export global standard apparel and textiles to international buyers with 100% transparency.
                            </p>
                        </div>
                        <div className="group bg-white dark:bg-dark-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 text-secondary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-secondary group-hover:text-white transition-all">
                                <Eye size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Our Vision</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                To become the premier buying house in Southeast Asia, known for sustainable manufacturing and ethical trade practices.
                            </p>
                        </div>
                        <div className="group bg-white dark:bg-dark-surface p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <Heart size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Our Values</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                Commitment, integrity, and trust. We value our professionals, buyers, and factory partners as the backbone of our success.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Growth Timeline */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Production Evolution</h2>
                        <p className="text-gray-500 font-medium">How we transformed from locally known to globally trusted.</p>
                    </div>

                    <div className="relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-100 dark:bg-gray-800 -translate-x-1/2 hidden md:block"></div>
                        <div className="space-y-16">
                            {timeline.map((item, idx) => (
                                <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                                    <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                        <div className="p-8 bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group">
                                            <span className="text-3xl font-black text-primary mb-2 block font-mono">{item.year}</span>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-secondary transition-colors">{item.title}</h4>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="relative z-10 w-12 h-12 bg-primary rounded-full border-4 border-white dark:border-dark-bg flex items-center justify-center text-white scale-110 hidden md:flex ring-4 ring-primary/10">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="w-full md:w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Manufacturing Capabilities Grid */}
            <section className="py-24 bg-primary text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black mb-8 tracking-tight font-heading">Production Sourcing <br /> Ecosystem</h2>
                            <p className="text-blue-100/80 mb-10 text-xl leading-relaxed font-light">
                                Our factory partner network is meticulously audited to handle complex apparel requirements from technical fabrics to intricate embroidery.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: <CheckCircle2 className="text-secondary" />, title: 'RMG Portfolio', desc: 'Knit, Woven and Sweater for all demographics.' },
                                    { icon: <Factory className="text-secondary" />, title: 'Home Textiles', desc: 'Bedding, Terry Towels and Curtains.' },
                                    { icon: <Ship className="text-secondary" />, title: 'Logistics Control', desc: 'End-to-end export management from Dhaka ports.' }
                                ].map((cap, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="mt-1">{cap.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{cap.title}</h4>
                                            <p className="text-sm text-blue-100/60 font-medium">{cap.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl text-center hover:bg-white/10 transition-all group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6 text-secondary group-hover:scale-110 transition-transform">
                                        {s.icon}
                                    </div>
                                    <div className="text-4xl font-black mb-1">{s.val}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/60">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications (Partnered with world leaders) */}
            <div className="py-24 bg-gray-50 dark:bg-dark-bg">
                <Certifications data={null} />
            </div>

            {/* CTA */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="bg-white dark:bg-dark-surface p-12 md:p-20 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative z-10 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter">Ready to upscale your <br /> sourcing experience?</h2>
                        <p className="text-gray-500 mb-10 text-lg font-medium">Join 50+ international brands who trust Apparel Emporium for their factory production needs.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact" className="bg-primary hover:bg-secondary text-white font-black px-10 py-5 rounded-3xl transition-all shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2">
                                Start Your Inquiry <ArrowRight size={20} />
                            </Link>
                            <Link href="/products" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white font-black px-10 py-5 rounded-3xl transition-all flex items-center justify-center">
                                View Portfolio
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

