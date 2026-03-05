import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardStatsProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend?: number;
    bgClass: string;
}

export default function DashboardStats({ icon, label, value, trend, bgClass }: DashboardStatsProps) {
    return (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group">
            <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-end gap-3">
                    <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white font-heading">{value}</h3>

                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-bold mb-1.5 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
            </div>

            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${bgClass}`}>
                {icon}
            </div>
        </div>
    );
}
