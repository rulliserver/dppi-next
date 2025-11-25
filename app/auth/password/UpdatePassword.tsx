'use client';

import { UrlApi } from '@/app/components/apiUrl';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import Swal from 'sweetalert2';

export default function UpdatePassword() {
    const [editData, setEditData]: any = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [processing, setProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const togglePassword = (key: 'old' | 'new' | 'confirm') => {
        setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Validasi di frontend
        if (editData.new_password !== editData.confirm_password) {
            Swal.fire({
                icon: 'error',
                text: 'Konfirmasi Password Tidak Sesuai',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb'
            });
            setProcessing(false);
            return;
        }

        if (editData.new_password.length < 6) {
            Swal.fire({
                icon: 'error',
                text: 'Password baru minimal 6 karakter',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb'
            });
            setProcessing(false);
            return;
        }

        try {
            // PERBAIKAN: Gunakan JSON instead of FormData
            const payload = {
                current_password: editData.old_password,
                new_password: editData.new_password,
                confirm_password: editData.confirm_password
            };

            const response = await fetch(`${UrlApi}/userpanel/change-password`, {
                method: 'PUT', // PERBAIKAN: Gunakan PUT (uppercase)
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json', // PERBAIKAN: Tambahkan header JSON
                },
                body: JSON.stringify(payload)
            });

            // PERBAIKAN: Handle response dengan lebih baik
            const responseText = await response.text();

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: responseText || 'Gagal mengubah password' };
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Parse response sukses
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                throw new Error('Invalid response from server');
            }

            Swal.fire({
                icon: 'success',
                text: result.message || 'Password Berhasil diupdate',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/userpanel';
                }
            });
        } catch (error: any) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                text: error.message || 'Terjadi kesalahan saat memperbarui password',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb'
            });
        } finally {
            setProcessing(false);
        }
    };

    const renderPasswordInput = (label: string, name: string, typeKey: 'old' | 'new' | 'confirm') => (
        <div className='grid lg:grid-cols-5 gap-2 mt-4 items-center'>
            <label className='text-sm col-span-2'>{label}</label>
            <div className='relative col-span-3'>
                <input
                    type={showPassword[typeKey] ? 'text' : 'password'}
                    name={name}
                    value={editData[name]}
                    onChange={handleChange}
                    className='form-control-admin-bp w-full pr-10'
                    required={name === 'old_password'}
                />
                <button type='button' onClick={() => togglePassword(typeKey)} className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600'>
                    {showPassword[typeKey] ? <i className='text-red-500 fa fa-eye' /> : <i className='text-red-500 fa fa-eye-slash' />}
                </button>
            </div>
        </div>
    );

    return (
        <div>
            <div className='py-4'>
                <div className='text-gray-900 flex flex-row justify-between mx-2'>
                    <div className='flex flex-row'>
                        <i className='text-red-600 fa fa-lock-open text-2xl md:text-4xl pr-2'></i>
                        <p className='text-sm md:text-xl py-1 font-semibold text-red-600'>UPDATE PASSWORD</p>
                    </div>
                </div>
            </div>

            <div className='relative p-0 overflow-hidden max-w-lg rounded-md shadow-sm shadow-gray-500 mr-2 dark:border-red-500 border'>
                <form onSubmit={handleSubmit}>
                    <div className='px-4 py-2 text-dark dark:text-white'>
                        {renderPasswordInput('Password Lama:', 'old_password', 'old')}
                        {renderPasswordInput('Password Baru:', 'new_password', 'new')}
                        {renderPasswordInput('Konfirmasi Password Baru:', 'confirm_password', 'confirm')}
                    </div>
                    <div className='flex justify-between px-4 pb-2 border-t-2 border-white'>
                        <Link href='/userpanel' className='cursor-pointer px-8 py-2 mt-2 text-white bg-red-500 rounded-md'>
                            Batal
                        </Link>
                        <button type='submit' className='cursor-pointer px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
                            {processing ? (
                                <div className='flex flex-row'>
                                    <ScaleLoader barCount={3} height={24} color='#ffb000' />
                                    &nbsp; Loading{' '}
                                </div>
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
