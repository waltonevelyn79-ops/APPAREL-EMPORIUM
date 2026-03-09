'use client';

import React, { useState, useEffect } from 'react';
import { UserCircle2, Edit2, Trash2, Plus, X, Loader2 } from 'lucide-react';

export default function UsersManager({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const openModal = (user?: any) => {
        if (user) {
            setFormData({ id: user.id, name: user.name, email: user.email, password: '', role: user.role });
            setIsEditing(true);
        } else {
            setFormData({ id: '', name: '', email: '', password: '', role: 'EDITOR' });
            setIsEditing(false);
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch('/api/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                if (isEditing) {
                    setUsers(users.map((u: any) => u.id === data.user.id ? data.user : u));
                } else {
                    setUsers([data.user, ...users]);
                }
                setIsModalOpen(false);
            } else {
                setError(data.error || 'Failed to ' + (isEditing ? 'update' : 'create') + ' user');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter((u: any) => u.id !== id));
            } else {
                alert(data.error || 'Failed to delete user');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage admin access and roles.</p>
                </div>
                <button onClick={() => openModal()} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add User
                </button>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden max-w-5xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                                <th className="p-5 font-semibold">User</th>
                                <th className="p-5 font-semibold">Email</th>
                                <th className="p-5 font-semibold">Role</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-5 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <UserCircle2 className="w-8 h-8 text-gray-400" />
                                        {user.name || 'No Name'}
                                    </td>
                                    <td className="p-5 text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase break-keep ${user.role === 'DEVELOPER' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                            user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                user.role === 'ADMIN' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right space-x-3">
                                        <button onClick={() => openModal(user)} className="text-primary hover:text-secondary transition-colors" title="Edit Role">
                                            <Edit2 className="w-4 h-4 inline-block" />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete User">
                                            <Trash2 className="w-4 h-4 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                {isEditing ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}

                            <div>
                                <label className="block text-sm font-semibold mb-1">Name</label>
                                <input type="text" required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Email</label>
                                <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Password {isEditing && <span className="text-xs font-normal text-gray-500">(Leave blank to keep current)</span>}</label>
                                <input type="password" required={!isEditing} name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Role</label>
                                <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary/50">
                                    <option value="EDITOR">EDITOR</option>
                                    <option value="AUTHOR">AUTHOR</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={loading} className="px-5 py-2 bg-primary hover:bg-secondary text-white rounded-xl transition-colors font-semibold shadow-md flex items-center justify-center min-w-[100px]">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

