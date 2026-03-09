'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError('Account verification failed. Please check credentials.');
            setLoading(false);
        } else {
            // Check role after successful login
            const sessionRes = await fetch('/api/auth/session');
            const session = await sessionRes.json();

            if (session.user?.role === 'BUYER') {
                router.push('/buyer-portal');
            } else {
                router.push('/executive-portal-aelbd');
            }
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black font-heading mb-2 uppercase tracking-tighter">
                        Buyer <span className="text-primary italic">Portal</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Authorised Access for Global Sourcing Network</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-8 text-center border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1">Corporate Email</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                            placeholder="admin@h-m.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block pl-1 font-heading">Security Key</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-black py-4.5 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group uppercase tracking-[0.2em] text-xs mt-4 disabled:opacity-70 disabled:translate-y-0 h-14"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Dashboard <ArrowRight size={16} /></>}
                    </button>
                </form>

                <div className="mt-10 text-center space-y-4">
                    <p className="text-sm text-gray-500 font-bold">
                        Become a Partner? <Link href="/register" className="text-primary hover:underline">Initialise Identity.</Link>
                    </p>
                    <div className="h-px bg-gray-100 w-1/3 mx-auto"></div>
                    <Link href="/executive-login" className="text-[10px] text-gray-400 uppercase font-black tracking-widest hover:text-primary transition-colors block">
                        Network Administration Node
                    </Link>
                </div>

            </div>
        </div>
    );
}
