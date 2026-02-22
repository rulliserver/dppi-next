'use client';
import React, { useState, useRef, FormEvent } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useUser } from '@/app/components/UserContext';
import Swal from 'sweetalert2';
import { UrlApi } from '@/app/components/apiUrl';
import { canvasPreview } from '@/app/components/CanvasPreview';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import InputLabel from '@/app/components/InputLabel';
import { BaseUrl } from '@/app/components/baseUrl';
import { ScaleLoader } from 'react-spinners';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: any) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export default function ProfileUser(props: any) {
    const { user, setUser }: any = useUser();
    const [processing, setProcessing] = useState(false);
    const [formEdit, setFormEdit] = useState(false);
    const handleBtnEdit = () => {
        setFormEdit(true);
    };
    const closeEditModal = () => {
        setFormEdit(false);
    };

    const [data, setData] = useState({
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        geotourism_name: user.geotourism_name
    });

    //avatar
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop]: any = useState();
    const [completedCrop, setCompletedCrop]: any = useState();
    const scale = 1;
    const rotate = 0;
    const aspect = 1 / 1;

    function onSelectFile(e: any) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined);
            const reader: any = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    function onImageLoad(e: any) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    useDebounceEffect(
        async () => {
            if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
                canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
            }
        },
        100,
        [completedCrop, scale, rotate]
    );

    const handleChangeEdit = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitEdit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const formData = new FormData();

            if (previewCanvasRef.current && completedCrop) {
                const canvas: any = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                if (croppedBlob && croppedBlob.size > 3 * 1024 * 1024) { // 2MB
                    Swal.fire('Error', 'File terlalu besar, maksimal 3MB', 'error');
                    setProcessing(false);
                    return;
                }
                if (croppedBlob) {
                    formData.append('avatar', croppedBlob, 'avatar.png');
                }
            }

            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('address', data.address || '');
            formData.append('phone', data.phone || '');
            const response = await fetch(`${UrlApi}/userpanel/profile`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            // 1. Cek jika response tidak OK
            if (!response.ok) {
                let errorMessage = 'Gagal memperbarui profil';

                if (response.status === 413) {
                    // Ini akan menangkap error "Request Entity Too Large" dari Nginx
                    errorMessage = 'Ukuran file terlalu besar! Maksimal 5MB.';
                } else if (response.status === 502 || response.status === 504) {
                    errorMessage = 'Server sedang sibuk atau down. Coba lagi nanti.';
                } else {
                    // Coba ambil pesan dari JSON jika ada, jika gagal (seperti HTML tadi), gunakan default
                    try {
                        const errorJson = await response.json();
                        errorMessage = errorJson.message || errorMessage;
                    } catch {
                        errorMessage = `Terjadi kesalahan (Error ${response.status})`;
                    }
                }

                // Langsung lempar error ke blok catch
                throw new Error(errorMessage);
            }

            // 2. Refresh user data
            const responseUser = await fetch(`${UrlApi}/user`, {
                credentials: 'include'
            });

            if (!responseUser.ok) {
                throw new Error('Gagal mengambil data user terbaru');
            }

            const userData = await responseUser.json();
            setUser(userData);

            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Profile berhasil diupdate',
                confirmButtonColor: '#2563eb'
            }).then((result) => {
                if (result.isConfirmed) {
                    setFormEdit(false);
                }
            });

        } catch (error: any) {
            console.error('Update error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Terjadi kesalahan sistem',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className='w-full'>
            {user ?
                <div className='px-0 mt-6 lg:px-4 '>
                    <div className='relative mb-4 overflow-hidden text-lg font-bold text-center dark:text-white'>PROFILE PENGGUNA </div>
                    <div className='flex justify-center'>
                        <div className='w-48 h-48 rounded-full overflow-clip'>
                            {user.avatar ? <img src={`${BaseUrl + user.avatar}`} alt='User avatar' className='w-48 h-auto' /> : <img src='/assets/images/logo-dppi.png' alt='Logo' className='w-48 h-auto' />}
                        </div>
                    </div>
                    <p className='mb-4 text-lg font-semibold text-center dark:text-white'>{user.role}</p>
                    <div className='max-w-xl mx-auto'>
                        <div className='relative grid grid-cols-3 p-2 bg-white border-2 rounded-md dark:bg-slate-700 dark:text-white border-orange-500'>
                            <p>Nama</p>
                            <p className='col-span-2'>: {data.name}</p>
                            <p>Email</p>
                            <p className='col-span-2'>: {data.email}</p>
                            <p>Alamat</p>
                            <p className='col-span-2'>: {data.address}</p>
                            <p>No. Telepon</p>
                            <p className='col-span-2'>: {data.phone}</p>
                            <button className='absolute p-1 mt-4 rounded-md -top-2 text-bg-green-500 right-1' onClick={handleBtnEdit}>
                                <i className='fas fa-edit'></i>
                            </button>
                        </div>
                    </div>
                </div>
                : processing}
            {formEdit && (
                <div className='fixed top-0 left-0 right-0 z-40 p-2 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                    <div className='relative w-full h-full max-w-3xl mx-auto top-20 md:h-auto bg-white rounded-lg shadow-lg dark:bg-slate-800'>
                        <div className='flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 dark:text-white'>Edit Profile</span>
                            </div>

                            <button
                                type='button'
                                onClick={closeEditModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                jasadataportasi-modal-hide='editModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <div className='border-b dark:border-white0 border border-slate-200'></div>
                        <form onSubmit={handleSubmitEdit} encType='multipart/form-data'>
                            <div className='px-4 py-2'>
                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='avatar' value='Foto Profile' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input className='col-span-3 px-2 py-1 bg-white border-2 rounded-md' type='file' accept='image/*' onChange={onSelectFile} />
                                </div>
                                <div className='grid grid-cols-2 gap-4 mx-48 mt-2'>
                                    {Boolean(imgSrc) && (
                                        <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                            <img
                                                ref={imgRef}
                                                alt='Crop me'
                                                src={imgSrc}
                                                data-form={`scale(${scale}) rotate(${rotate}deg)`}
                                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                                onLoad={onImageLoad}
                                            />
                                        </ReactCrop>
                                    )}
                                    <div>
                                        {Boolean(completedCrop) && (
                                            <canvas
                                                ref={previewCanvasRef}
                                                style={{
                                                    border: '1px solid black',
                                                    objectFit: 'contain',
                                                    width: completedCrop.width,
                                                    height: completedCrop.height
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <p className='mb-2 text-xs text-red-500'> *) abaikan jika tidak ada perubahan avatar</p>

                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='name' value='Nama Lengkap' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white border p-2 dark:border-orange-500'
                                        type='text'
                                        pattern='[^$<>\x22]+'
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={data.name}
                                        onChange={handleChangeEdit}
                                        id='name'
                                        name='name'
                                        required
                                    />
                                </div>
                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='email' value='Email' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm bg-slate-200 dark:bg-slate-600 focus:border-indigo-500 focus:ring-indigo-500 dark:text-white border p-2 dark:border-orange-500'
                                        type='email'
                                        defaultValue={data.email}
                                        onChange={handleChangeEdit}
                                        id='email'
                                        name='email'
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='address' value='Alamat' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white border p-2 dark:border-orange-500'
                                        type='text'
                                        pattern='[^$<>\x22]+'
                                        title='Tidak diperbolehkan karakter khusus'
                                        defaultValue={data.address}
                                        onChange={handleChangeEdit}
                                        id='address'
                                        name='address'
                                        required
                                    />
                                </div>

                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='phone' value='No. Telepon' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:text-white border p-2 dark:border-orange-500'
                                        type='number'
                                        step={1}
                                        defaultValue={data.phone}
                                        onChange={handleChangeEdit}
                                        id='phone'
                                        name='phone'
                                        required
                                    />
                                </div>
                            </div>
                            <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                            <div className='flex flex-row justify-end'>
                                <button className='cursor-pointer mx-5 my-2 col-start-3 py-1 px-4 text-white rounded-lg bg-green-500 hover:bg-green-600' type='submit'>
                                    {processing ? (
                                        <div className='flex flex-row'>
                                            <ScaleLoader barCount={3} height={24} color='#ffb000' />
                                            &nbsp; Loading{' '}
                                        </div>
                                    ) : (
                                        'SUBMIT'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
