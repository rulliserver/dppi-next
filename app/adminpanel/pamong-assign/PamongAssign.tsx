// app/adminpanel/pamong-assign/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { UrlApi } from '@/app/components/apiUrl';
import Swal from 'sweetalert2';
import Select from 'react-select';

interface Capaska {
    id: number;
    nama_lengkap: string;
    jk: string;
    id_pamong: string | null;
}

interface Pamong {
    id: string;
    nama_user: string;
    count_assigned: number;
}

export default function AssignPamongPage() {
    const [capaskas, setCapaskas] = useState<Capaska[]>([]);
    const [pamongs, setPamongs] = useState<Pamong[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch capaskas
            const capaskaRes = await fetch(`${UrlApi}/pemusatan/candidates`, {
                credentials: 'include'
            });
            const capaskaData = await capaskaRes.json();
            setCapaskas(capaskaData);

            // Fetch pamongs
            const pamongRes = await fetch(`${UrlApi}/pemusatan/list-pamong`, {
                credentials: 'include'
            });
            const pamongData = await pamongRes.json();
            setPamongs(pamongData);
        } catch (err: any) {
            Swal.fire('Error', err.message || 'Gagal memuat data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (idCapaska: number, idPamong: string | null) => {
        try {
            setSubmitting(true);
            
            if (!idPamong) {
                // Unassign
                const res = await fetch(`${UrlApi}/pemusatan/assign-pamong`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_capaska: idCapaska,
                        id_pamong: '' // Empty string to unassign
                    }),
                    credentials: 'include'
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message);

                Swal.fire('Berhasil!', 'Pamong berhasil di-unassign', 'success');
            } else {
                // Assign
                const res = await fetch(`${UrlApi}/pemusatan/assign-pamong`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_capaska: idCapaska,
                        id_pamong: idPamong
                    }),
                    credentials: 'include'
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message);

                Swal.fire('Berhasil!', 'Pamong berhasil diassign', 'success');
            }

            // Refresh data
            await fetchData();
        } catch (err: any) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const selectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: state.isFocused ? '#7c3aed' : isDark ? '#374151' : '#d1d5db',
            minHeight: '38px',
            fontSize: '14px',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? '#7c3aed' 
                : state.isFocused 
                    ? isDark ? '#374151' : 'rgba(124, 58, 237, 0.1)' 
                    : isDark ? '#1f2937' : '#ffffff',
            color: state.isSelected 
                ? '#ffffff' 
                : isDark ? '#f3f4f6' : '#1f2937',
            fontSize: '14px',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: isDark ? '#f3f4f6' : '#1f2937'
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: isDark ? '#1f2937' : '#ffffff'
        }),
        input: (provided: any) => ({
            ...provided,
            color: isDark ? '#f3f4f6' : '#1f2937'
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: isDark ? '#9ca3af' : '#6b7280'
        })
    };

    const pamongOptions = [
        { value: '', label: '-- Unassign --' },
        ...pamongs.map(p => ({
            value: p.id,
            label: `${p.nama_user} (${p.count_assigned} peserta)`
        }))
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto mb-20">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    👥 Assign Pamong ke Capaska
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Atur penugasan Pamong untuk setiap Capaska (maksimal 7 per Pamong)
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Nama Capaska</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">JK</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Pamong Saat Ini</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Assign Pamong</th>
                            </tr>
                        </thead>
                        <tbody>
                            {capaskas.map((capaska, index) => {
                                const currentPamong = pamongs.find(p => p.id === capaska.id_pamong);
                                
                                return (
                                    <tr 
                                        key={capaska.id}
                                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="py-3 px-3 text-gray-500">{index + 1}</td>
                                        <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                                            {capaska.nama_lengkap}
                                        </td>
                                        <td className="py-3 px-3 text-gray-500">
                                            {capaska.jk.toUpperCase()}
                                        </td>
                                        <td className="py-3 px-3">
                                            {currentPamong ? (
                                                <span className="px-2 py-1 bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 rounded-full text-xs font-medium">
                                                    {currentPamong.nama_user}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">Belum diassign</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="max-w-62.5">
                                                <Select
                                                    value={pamongOptions.find(opt => opt.value === (capaska.id_pamong || ''))}
                                                    onChange={(option) => {
                                                        if (option) {
                                                            handleAssign(capaska.id, option.value || null);
                                                        }
                                                    }}
                                                    options={pamongOptions}
                                                    styles={selectStyles}
                                                    placeholder="Pilih Pamong..."
                                                    isSearchable
                                                    isLoading={submitting}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {capaskas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Tidak ada data Capaska</p>
                    </div>
                )}
            </div>
        </div>
    );
}