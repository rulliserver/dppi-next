'use client';

import React, { useEffect, useState } from 'react';
import PaskibrakaLayout from '../../Layouts/PaskibrakaLayout';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';

interface ProfileData {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        phone?: string;
        address?: string;
        nama_sekolah?: string;
        guru_pembimbing?: string;
        no_hp_guru_pembimbing?: string;
    };
    capaska_details?: {
        id: number;
        no_peserta?: string;
        nama_lengkap?: string;
        jk?: string;
        photo?: string;
        provinsi?: string;
        kabupaten_kota?: string;
        status?: string;
        asal_sekolah?: string;
        guru_pembimbing?: string;
        no_hp_guru_pembimbing?: string;
    };
}

interface PhysicalRecord {
    id: string;
    bulan: string;
    tb: number;
    bb: number;
    catatan?: string;
    tanggal?: string;
    created_at?: string;
}

export default function PaskibrakaProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [records, setRecords] = useState<PhysicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Edit Profile Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editNamaSekolah, setEditNamaSekolah] = useState('');
    const [editGuruPembimbing, setEditGuruPembimbing] = useState('');
    const [editNoHpGuru, setEditNoHpGuru] = useState('');
    const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Form BB/TB
    const todayStr = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        tanggal: todayStr,
        bulan: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        tb: '',
        bb: '',
        catatan: '',
    });

    const handleDateChange = (selectedDate: string) => {
        if (!selectedDate) return;
        const d = new Date(selectedDate);
        const bulanFormatted = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        setForm({
            ...form,
            tanggal: selectedDate,
            bulan: bulanFormatted
        });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resProf, resRec] = await Promise.all([
                fetch(`${UrlApi}/paskibraka/profile`, { credentials: 'include' }),
                fetch(`${UrlApi}/paskibraka/physical-records`, { credentials: 'include' })
            ]);

            if (resProf.ok) {
                const dataProf = await resProf.json();
                setProfile(dataProf);
                setEditPhone(dataProf.user?.phone || '');
                setEditAddress(dataProf.user?.address || '');
                setEditNamaSekolah(dataProf.user?.nama_sekolah || dataProf.capaska_details?.asal_sekolah || '');
                setEditGuruPembimbing(dataProf.user?.guru_pembimbing || dataProf.capaska_details?.guru_pembimbing || '');
                setEditNoHpGuru(dataProf.user?.no_hp_guru_pembimbing || dataProf.capaska_details?.no_hp_guru_pembimbing || '');
            }
            if (resRec.ok) {
                const dataRec = await resRec.json();
                setRecords(dataRec.data || []);
            }
        } catch (err) {
            console.error('Failed fetching profile/records', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openEditModal = () => {
        setEditPhone(profile?.user?.phone || '');
        setEditAddress(profile?.user?.address || '');
        setEditNamaSekolah(profile?.user?.nama_sekolah || profile?.capaska_details?.asal_sekolah || '');
        setEditGuruPembimbing(profile?.user?.guru_pembimbing || profile?.capaska_details?.guru_pembimbing || '');
        setEditNoHpGuru(profile?.user?.no_hp_guru_pembimbing || profile?.capaska_details?.no_hp_guru_pembimbing || '');
        setEditPhotoFile(null);
        setPhotoPreview(null);
        setIsEditModalOpen(true);
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSavingProfile(true);
            const formData = new FormData();
            formData.append('phone', editPhone);
            formData.append('address', editAddress);
            formData.append('nama_sekolah', editNamaSekolah);
            formData.append('guru_pembimbing', editGuruPembimbing);
            formData.append('no_hp_guru_pembimbing', editNoHpGuru);
            if (editPhotoFile) {
                formData.append('photo', editPhotoFile);
            }

            const res = await fetch(`${UrlApi}/paskibraka/profile`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Gagal mengupdate profil');

            Swal.fire({
                icon: 'success',
                title: 'Profil Diperbarui',
                text: 'Data profil berhasil disimpan!',
                timer: 2000,
                showConfirmButton: false
            });

            setIsEditModalOpen(false);
            fetchData();
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal menyimpan profil', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.tb || !form.bb) {
            Swal.fire('Perhatian', 'Mohon isi Tinggi Badan (TB) dan Berat Badan (BB)', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`${UrlApi}/paskibraka/physical-records`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    tanggal: form.tanggal,
                    bulan: form.bulan,
                    tb: parseFloat(form.tb),
                    bb: parseFloat(form.bb),
                    catatan: form.catatan
                })
            });

            if (!res.ok) throw new Error('Gagal menyimpan rekam medis/fisik');

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Data BB & TB bulanan berhasil disimpan!',
                timer: 2000,
                showConfirmButton: false
            });

            setForm({
                tanggal: new Date().toISOString().split('T')[0],
                bulan: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
                tb: '',
                bb: '',
                catatan: ''
            });

            fetchData();
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const calculateBMI = (tb: number, bb: number) => {
        if (!tb || !bb) return { bmi: 0, status: 'Tidak Diketahui', color: 'bg-slate-100 text-slate-700' };
        const heightM = tb / 100;
        const bmi = bb / (heightM * heightM);
        if (bmi < 18.5) return { bmi: bmi.toFixed(1), status: 'Kurang (Underweight)', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' };
        if (bmi <= 24.9) return { bmi: bmi.toFixed(1), status: 'Ideal (Normal)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' };
        if (bmi <= 29.9) return { bmi: bmi.toFixed(1), status: 'Kelebihan (Overweight)', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' };
        return { bmi: bmi.toFixed(1), status: 'Obesitas', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' };
    };

    const latestRecord = records.length > 0 ? records[0] : null;
    const latestBMI = latestRecord ? calculateBMI(latestRecord.tb, latestRecord.bb) : null;

    const currentPhoto = profile?.user?.avatar || profile?.capaska_details?.photo;
    const photoUrl = currentPhoto
        ? currentPhoto.startsWith('http') ? currentPhoto : `${UrlApi}/${currentPhoto}`
        : null;

    const sekolahDisplay = profile?.user?.nama_sekolah || profile?.capaska_details?.asal_sekolah || '-';
    const guruDisplay = profile?.user?.guru_pembimbing || profile?.capaska_details?.guru_pembimbing || '-';
    const noHpGuruDisplay = profile?.user?.no_hp_guru_pembimbing || profile?.capaska_details?.no_hp_guru_pembimbing || '-';

    return (
        <PaskibrakaLayout>
            <div className="space-y-6">
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profil & Fisik Paskibraka</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Kelola data pribadi, informasi sekolah, dan pembaruan Tinggi Badan (TB) & Berat Badan (BB) bulanan Anda.
                        </p>
                    </div>
                    {latestBMI && (
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                            <div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">BMI Terkini</span>
                                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{latestBMI.bmi}</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${latestBMI.color}`}>
                                {latestBMI.status}
                            </span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">Memuat profil Paskibraka...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Info Card */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-700">
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt="Foto Profil"
                                        className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md"
                                    />
                                ) : (
                                    <div className="w-24 h-24 mx-auto rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl font-extrabold border-4 border-white dark:border-slate-700 shadow-md">
                                        {profile?.user?.name?.charAt(0).toUpperCase() || 'P'}
                                    </div>
                                )}
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
                                    {profile?.capaska_details?.nama_lengkap || profile?.user?.name}
                                </h2>
                                <p className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 inline-block px-3 py-1 rounded-full mt-1">
                                    Paskibraka
                                </p>

                                <div className="mt-4">
                                    <button
                                        onClick={openEditModal}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs rounded-xl shadow transition flex items-center gap-1.5 mx-auto"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Profil Lengkap
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Nomor Peserta / NIK</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {profile?.capaska_details?.no_peserta || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Email Registered</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {profile?.user?.email || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">No. Telepon Siswa</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {profile?.user?.phone || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Nama Sekolah / Asal Sekolah</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {sekolahDisplay}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Guru Pembimbing Paskibra</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {guruDisplay}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">No. HP Guru Pembimbing</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {noHpGuruDisplay}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Alamat Lengkap</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-line">
                                        {profile?.user?.address || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Jenis Kelamin</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {profile?.capaska_details?.jk === 'L' ? 'Laki-laki' : profile?.capaska_details?.jk === 'P' ? 'Perempuan' : profile?.capaska_details?.jk || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Provinsi / Daerah</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {profile?.capaska_details?.provinsi || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Kabupaten / Kota</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                        {profile?.capaska_details?.kabupaten_kota || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Update BB/TB & History */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Input Form BB/TB */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Update Berat Badan (BB) & Tinggi Badan (TB) Bulanan
                                </h3>

                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                                Tanggal Update *
                                            </label>
                                            <input
                                                type="date"
                                                value={form.tanggal}
                                                onChange={(e) => handleDateChange(e.target.value)}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                                Bulan / Periode
                                            </label>
                                            <input
                                                type="text"
                                                value={form.bulan}
                                                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="Agustus 2026"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                                Tinggi Badan (TB - cm) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={form.tb}
                                                onChange={(e) => setForm({ ...form, tb: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="175"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                                Berat Badan (BB - kg) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={form.bb}
                                                onChange={(e) => setForm({ ...form, bb: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="68"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                            Catatan Tambahan (Opsional)
                                        </label>
                                        <textarea
                                            value={form.catatan}
                                            onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            rows={2}
                                            placeholder="Contoh: Update rutin akhir bulan..."
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 text-sm flex items-center gap-2"
                                        >
                                            {submitting ? 'Menyimpan...' : 'Simpan Data Tanggal Ini'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* History Table */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                    Riwayat Perkembangan Fisik Bulanan
                                </h3>

                                {records.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        Belum ada data rekam medis/fisik bulanan yang dimasukkan.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-l-lg">Tanggal Rekam</th>
                                                    <th className="px-4 py-3">Bulan</th>
                                                    <th className="px-4 py-3">TB (cm)</th>
                                                    <th className="px-4 py-3">BB (kg)</th>
                                                    <th className="px-4 py-3">Status BMI</th>
                                                    <th className="px-4 py-3 rounded-r-lg">Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                                {records.map((r) => {
                                                    const bmiInfo = calculateBMI(r.tb, r.bb);
                                                    return (
                                                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                                            <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                                                                {r.tanggal ? new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                            </td>
                                                            <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                                                                {r.bulan}
                                                            </td>
                                                            <td className="px-4 py-3.5 font-medium">{r.tb} cm</td>
                                                            <td className="px-4 py-3.5 font-medium">{r.bb} kg</td>
                                                            <td className="px-4 py-3.5">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${bmiInfo.color}`}>
                                                                    {bmiInfo.bmi} ({bmiInfo.status})
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                                {r.catatan || '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Edit Profile */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                Edit Profil Paskibraka
                            </h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-sm overflow-y-auto flex-1">
                            {/* Photo Picker */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Foto Profil (Photo)
                                </label>
                                <div className="flex items-center gap-4">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-red-500" />
                                    ) : photoUrl ? (
                                        <img src={photoUrl} alt="Profil" className="w-16 h-16 rounded-full object-cover border-2 border-slate-300" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-xl">
                                            P
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handlePhotoSelect}
                                        className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                    />
                                </div>
                            </div>

                            {/* Nama Sekolah */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Nama Sekolah / Asal Sekolah
                                </label>
                                <input
                                    type="text"
                                    value={editNamaSekolah}
                                    onChange={(e) => setEditNamaSekolah(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="SMA Negeri 1..."
                                />
                            </div>

                            {/* Guru Pembimbing & No HP Guru Pembimbing */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Guru Pembimbing Paskibra
                                    </label>
                                    <input
                                        type="text"
                                        value={editGuruPembimbing}
                                        onChange={(e) => setEditGuruPembimbing(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="Nama Guru Pembimbing..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        No. HP Guru Pembimbing
                                    </label>
                                    <input
                                        type="text"
                                        value={editNoHpGuru}
                                        onChange={(e) => setEditNoHpGuru(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="081234567890"
                                    />
                                </div>
                            </div>

                            {/* No. Telepon Siswa */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    No. Telepon Siswa / WhatsApp
                                </label>
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="081234567890"
                                />
                            </div>

                            {/* Alamat Lengkap */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Alamat Lengkap (Tanpa Provinsi & Kabupaten/Kota)
                                </label>
                                <textarea
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Jl. Merdeka No. 17, RT 01 / RW 02..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                                >
                                    {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </PaskibrakaLayout>
    );
}
