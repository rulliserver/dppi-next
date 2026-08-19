'use client';

import React, { useState } from 'react';
import PaskibrakaLayout from '../../Layouts/PaskibrakaLayout';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';

export default function PaskibrakaChangePasswordPage() {
    const [form, setForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.old_password || !form.new_password || !form.confirm_password) {
            Swal.fire('Perhatian', 'Mohon isi semua kolom password', 'warning');
            return;
        }

        if (form.new_password.length < 6) {
            Swal.fire('Perhatian', 'Password baru minimal 6 karakter', 'warning');
            return;
        }

        if (form.new_password !== form.confirm_password) {
            Swal.fire('Perhatian', 'Konfirmasi password baru tidak cocok', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`${UrlApi}/paskibraka/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal mengubah password');
            }

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: data.message || 'Password Anda berhasil diperbarui!',
            });

            setForm({
                old_password: '',
                new_password: '',
                confirm_password: '',
            });
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan saat mengubah password', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PaskibrakaLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header Title */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xl font-bold">
                            🔒
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ubah Password Akun</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                Perbarui kata sandi Paskibraka Anda secara berkala demi keamanan akun.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Password Lama */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Password Saat Ini / Lama *
                            </label>
                            <div className="relative">
                                <input
                                    type={showOld ? 'text' : 'password'}
                                    value={form.old_password}
                                    onChange={(e) => setForm({ ...form, old_password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                    placeholder="Masukkan password lama..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOld(!showOld)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                                >
                                    {showOld ? 'Sembunyikan' : 'Lihat'}
                                </button>
                            </div>
                        </div>

                        {/* Password Baru */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Password Baru *
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={form.new_password}
                                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                    placeholder="Minimal 6 karakter..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                                >
                                    {showNew ? 'Sembunyikan' : 'Lihat'}
                                </button>
                            </div>
                        </div>

                        {/* Konfirmasi Password Baru */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Konfirmasi Password Baru *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirm_password}
                                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none pr-10"
                                    placeholder="Ketik ulang password baru..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                                >
                                    {showConfirm ? 'Sembunyikan' : 'Lihat'}
                                </button>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PaskibrakaLayout>
    );
}
