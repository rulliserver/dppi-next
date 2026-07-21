// app/adminpanel/capaska/edit/[id]/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';

interface CapaskaData {
    id: number;
    nama_lengkap: string;
    photo: string | null;
    jk: string;
    asal_sekolah: string | null;
    no_peserta: string | null;
    no_hp: string | null;
    tanggal_lahir: string | null;
    tempat_lahir: string | null;
    provinsi: string | null;
    kabupaten_kota: string | null;
    status: string | null;
    id_pamong: string | null;
}

export default function EditCapaskaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [formData, setFormData] = useState<CapaskaData>({
        id: 0,
        nama_lengkap: '',
        photo: null,
        jk: '',
        asal_sekolah: '',
        no_peserta: '',
        no_hp: '',
        tanggal_lahir: '',
        tempat_lahir: '',
        provinsi: '',
        kabupaten_kota: '',
        status: '',
        id_pamong: '',
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (id) {
            fetchCapaskaData();
        }
    }, [id]);

    const fetchCapaskaData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${UrlApi}/pemusatan/capaska/${id}`, {
                credentials: 'include'
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Gagal memuat data');
            }

            const data = await res.json();
            setFormData(data);
            if (data.photo) {
                setPhotoPreview(`${UrlApi.replace('/api', '')}/uploads/capaska/${data.photo}`);
            }
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error');
            router.push('/adminpanel/pemusatan/jurnal-profiling');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran file maksimal 2MB', 'error');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
                Swal.fire('Error', 'Format file harus JPG, PNG, WEBP', 'error');
                return;
            }
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhotoPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadPhoto = async () => {
        if (!photoFile) return;

        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('photo', photoFile);

            const res = await fetch(`${UrlApi}/pemusatan/capaska/${id}/photo`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal upload foto');

            Swal.fire('Berhasil!', 'Foto berhasil diupload', 'success');
            setPhotoFile(null);
            await fetchCapaskaData();
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan', 'error');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const removePhoto = async () => {
        try {
            const res = await fetch(`${UrlApi}/pemusatan/capaska/${id}/photo`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menghapus foto');

            Swal.fire('Berhasil!', 'Foto berhasil dihapus', 'success');
            setPhotoPreview(null);
            setPhotoFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await fetchCapaskaData();
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Update data
            const res = await fetch(`${UrlApi}/pemusatan/capaska/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Gagal menyimpan data');

            // If there's a new photo, upload it
            if (photoFile) {
                await uploadPhoto();
            }

            Swal.fire({
                title: 'Berhasil!',
                text: 'Data Capaska berhasil diperbarui.',
                icon: 'success',
                confirmButtonColor: '#7c3aed'
            });

            router.push('/adminpanel/pemusatan/jurnal-profiling');
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan server', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Memuat data peserta...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto mb-20">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Data Capaska</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Perbarui data peserta Paskibraka
                    </p>
                </div>
                <button
                    onClick={() => router.push('/adminpanel/pemusatan/jurnal-profiling')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded text-xs font-bold transition-colors"
                >
                    Kembali
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                {/* Photo Upload */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-400 text-xs p-2">
                                    <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Upload Foto</span>
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded text-sm font-medium transition-colors"
                        >
                            {photoPreview ? 'Ganti Foto' : 'Upload Foto'}
                        </button>
                        {photoPreview && (
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors block"
                            >
                                Hapus Foto
                            </button>
                        )}
                        {uploadingPhoto && (
                            <p className="text-xs text-violet-600">Mengupload foto...</p>
                        )}
                        <p className="text-xs text-gray-500">Format: JPG, PNG, WEBP (Max 2MB)</p>
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nama Lengkap *</label>
                        <input
                            type="text"
                            name="nama_lengkap"
                            value={formData.nama_lengkap}
                            onChange={handleInputChange}
                            required
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Jenis Kelamin *</label>
                        <select
                            name="jk"
                            value={formData.jk}
                            onChange={handleInputChange}
                            required
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        >
                            <option value="">Pilih</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Asal Sekolah</label>
                        <input
                            type="text"
                            name="asal_sekolah"
                            value={formData.asal_sekolah || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">No. Peserta</label>
                        <input
                            type="text"
                            name="no_peserta"
                            value={formData.no_peserta || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">No. HP</label>
                        <input
                            type="tel"
                            name="no_hp"
                            value={formData.no_hp || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tanggal Lahir</label>
                        <input
                            type="date"
                            name="tanggal_lahir"
                            value={formData.tanggal_lahir || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tempat Lahir</label>
                        <input
                            type="text"
                            name="tempat_lahir"
                            value={formData.tempat_lahir || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Provinsi</label>
                        <input
                            type="text"
                            name="provinsi"
                            value={formData.provinsi || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Kabupaten/Kota</label>
                        <input
                            type="text"
                            name="kabupaten_kota"
                            value={formData.kabupaten_kota || ''}
                            onChange={handleInputChange}
                            className="p-2.5 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>💾 Simpan Perubahan</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/adminpanel/pemusatan/jurnal-profiling')}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded font-bold text-sm transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}