'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle2, Edit2, Trash2, Plus, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function UsersPage() {
    const { data: session } = useSession();
    const currentUserRole = (session?.user as any)?.role || 'VIEWER';
    const currentUserId = (session?.user as any)?.id;

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'EDITOR', isActive: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user?: any) => {
        if (user) {
            setFormData({ id: user.id, name: user.name || '', email: user.email, password: '', role: user.role, isActive: user.isActive });
            setIsEditing(true);
        } else {
            setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR', isActive: true });
            setIsEditing(false);
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const endpoint = isEditing ? `/api/users/${formData.id}` : '/api/users';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                if (isEditing) {
                    setUsers(users.map(u => u.id === data.user.id ? data.user : u));
                } else {
                    setUsers([data.user, ...users]);
                }
                setIsModalOpen(false);
            } else {
                setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} user`);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u.id !== id));
            } else {
                alert(data.error || 'Failed to delete user');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const getAvailableRoles = () => {
        if (currentUserRole === 'DEVELOPER') {
            return ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER', 'BUYER'];
        }
        return ['ADMIN', 'EDITOR', 'VIEWER', 'BUYER'];
    };

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage admins, editors, and other system users.</p>
                </div>
                <button onClick={() => openModal()} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-5 h-5" /> Add New User
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                <th className="p-5 font-semibold">User</th>
                                <th className="p-5 font-semibold">Email</th>
                                <th className="p-5 font-semibold">Role</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold">Last Login</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 text-sm">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-5 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                                        ) : (
                                            <UserCircle2 className="w-9 h-9 text-gray-300" />
                                        )}
                                        {user.name || 'No Name'}
                                    </td>
                                    <td className="p-5 text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'DEVELOPER' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    user.role === 'ADMIN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {user.isActive ? (
                                            <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs"><CheckCircle className="w-4 h-4" /> Active</span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-red-500 font-medium text-xs"><XCircle className="w-4 h-4" /> Inactive</span>
                                        )}
                                    </td>
                                    <td className="p-5 text-gray-500 dark:text-gray-400 text-xs">
                                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-5 text-right space-x-2">
                                        <button onClick={() => openModal(user)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit User">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={user.id === currentUserId}
                                            className={`p-2 transition-colors rounded-lg ${user.id === currentUserId ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                            title={user.id === currentUserId ? 'Cannot delete yourself' : 'Delete User'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {isEditing ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">{error}</div>}

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Password {isEditing && <span className="text-xs font-normal text-gray-500">(Leave blank to keep current)</span>}</label>
                                <input type="password" required={!isEditing} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Role</label>
                                    <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50 transition-shadow">
                                        {getAvailableRoles().map(role => (
                                            <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-start mt-6 pl-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-semibold">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl transition-all shadow-md font-bold flex items-center justify-center min-w-[120px]">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
