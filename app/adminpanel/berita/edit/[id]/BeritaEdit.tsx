// components/BeritaEdit.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import axios from 'axios';

import { canvasPreview } from '@/app/components/CanvasPreview';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import { UrlApi } from '@/app/components/apiUrl';
import InputLabel from '@/app/components/InputLabel';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@/app/components/UserContext';
import Swal from 'sweetalert2';

interface Post {
    id: number;
    title: string;
    slug: string;
    news_category: string;
    tanggal: string;
    view: number;
    photo: string;
    caption: string;
    body: string;
    author: string;
    sumber: string;
    status?: '0' | '1' | '2' | number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

function toYMD(input?: string): string | undefined {
    if (!input) return undefined;
    // kalau sudah yyyy-MM-dd, langsung pakai
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export default function BeritaEdit() {
    const { user } = useUser();
    const params = useParams();
    const id = useMemo(() => {
        // useParams() bisa balikin string | string[]; amanin jadi string
        const raw = (params?.id ?? '').toString();
        return raw;
    }, [params]);

    const [data, setData] = useState<Post | null>(null);
    const [body, setBody] = useState<string>('');

    // ReactCrop states
    const [imgSrc, setImgSrc] = useState<string>('');
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const scale = 1;
    const rotate = 0;
    const aspect = 16 / 9;

    // --- Fetch detail post ---
    const getPost = async () => {
        try {
            const res = await axios.get<Post>(`${UrlApi}/adminpanel/post/${id}`, {
                withCredentials: true,
            });
            setData(res.data);
            setBody(res.data?.body ?? '');
        } catch (err) {
            console.error('getPost error:', err);
        }
    };

    useEffect(() => {
        if (id) getPost();
        // depend ke id (bukan setState fn)
    }, [id]);

    // --- Image select / crop ---
    function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // biar crop preview update antar gambar
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const el = e.currentTarget;
        if (aspect && el?.naturalWidth && el?.naturalHeight) {
            setCrop(centerAspectCrop(el.naturalWidth, el.naturalHeight, aspect));
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

    // --- Form handlers ---
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setData((prev) => (prev ? { ...prev, [name]: value } as Post : prev));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        const formData = new FormData();

        // jika ada canvas crop (user upload & crop)
        if (previewCanvasRef.current && completedCrop?.width && completedCrop?.height) {
            const canvas = previewCanvasRef.current;
            const croppedBlob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
            );
            if (croppedBlob) {
                formData.append('photo', croppedBlob, 'cover.jpg');
            }
        }

        // field-field lain
        formData.append('title', data.title ?? '');
        formData.append('news_category', data.news_category ?? '');
        formData.append('tanggal', toYMD(data.tanggal) ?? '');
        formData.append('caption', data.caption ?? '');
        formData.append('author', data.author ?? '');
        formData.append('sumber', data.sumber ?? '');
        if (typeof data.status !== 'undefined' && data.status !== null) {
            formData.append('status', String(data.status));
        }
        formData.append('body', body ?? '');

        try {
            await axios.put(`${UrlApi}/adminpanel/berita/update/${data.id}`, formData, {
                withCredentials: true,
                headers: {
                    // biarkan axios set boundary otomatis
                    'Accept': 'application/json',
                },
            });

            Swal.fire({
                icon: 'success',
                text: 'Berita berhasil diupdate',
                showConfirmButton: true,
                confirmButtonText: 'Kembali ke Data Berita',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/berita';
                }
            });
        } catch (error) {
            console.error('update error:', error);
        }
    };

    return (
        <>
            <div className='block'>
                <div className='px-2 py-2 text-dark dark:text-white'>
                    <i className='fas fa-th' /> Edit Berita
                </div>
            </div>

            <div className='flex flex-col p-4  rounded-t dark:border-gray-600' />
            <div className='col-span-5 px-3 mx-3 bg-gray-300 rounded-md shadow-md dark:bg-default shadow-red-100'>
                <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'>
                    <div className='font-bold text-center text-dark dark:text-white'>UPDATE BERITA</div>
                </div>

                <form onSubmit={submit} encType='multipart/form-data' className='py-4 mx-2'>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='title' value='Judul Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 text-sm bg-white border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleEditChange}
                            id='title'
                            name='title'
                            value={data?.title ?? ''}
                            required
                        />
                    </div>

                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='picture' value='Gambar' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 px-2 py-1 bg-white border-2 rounded-md'
                            type='file'
                            accept='image/*'
                            onChange={onSelectFile}
                        />
                    </div>

                    {Boolean(imgSrc) && (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                        >
                            <img
                                ref={imgRef}
                                alt='Crop me'
                                src={imgSrc}
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
                                    width: completedCrop?.width,
                                    height: completedCrop?.height,
                                }}
                            />
                        )}
                    </div>

                    <p className='mb-4 text-sm text-red-600 dark:text-yellow-500'>
                        *) Abaikan upload jika tidak ada perubahan photo/gambar berita
                    </p>

                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='caption' value='Caption Gambar' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 text-sm bg-white border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleEditChange}
                            id='caption'
                            name='caption'
                            value={data?.caption ?? ''}
                        />
                    </div>

                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='sumber' value='Sumber Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 text-sm bg-white border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleEditChange}
                            id='sumber'
                            name='sumber'
                            value={data?.sumber ?? ''}
                        />
                    </div>

                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='author' value='Author Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 text-sm bg-white border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleEditChange}
                            id='author'
                            name='author'
                            value={data?.author ?? ''}
                        />
                    </div>

                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='tanggal' value='Tanggal Rilis' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-1 bg-white text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='date'
                            onChange={handleEditChange}
                            id='tanggal'
                            name='tanggal'
                            value={toYMD(data?.tanggal) ?? ''}
                        />
                    </div>

                    {(user?.role === 'Superadmin' || user?.role === 'Administrator') && (
                        <div className='grid grid-cols-5 mt-1 mr-2'>
                            <InputLabel htmlFor='status' value='Status Berita' className='flex py-1 text-sm text-dark  dark:text-white' />
                            <select
                                name='status'
                                id='status'
                                required
                                value={String(data?.status ?? '0')}
                                onChange={handleEditChange}
                                className='col-span-1 text-sm border-gray-300 rounded-md bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            >
                                <option value='0'>Belum disetujui</option>
                                <option value='1'>Disetujui</option>
                                <option value='2'>Ditolak</option>
                            </select>
                        </div>
                    )}

                    <InputLabel htmlFor='body' value='Isi Content:' className='flex py-2 mt-2 text-sm text-dark dark:text-white' />
                    <div className='dark:bg-dark bg-white'>
                        <CKEditor
                            onReady={(editor: any) => {
                                const editable = editor.ui.getEditableElement();
                                const toolbarEl = editor.ui.view.toolbar.element;
                                editable?.parentElement?.insertBefore(toolbarEl, editable);
                            }}
                            editor={DecoupledEditor as any}
                            data={data?.body ?? ''}
                            onChange={(_, editor) => {
                                setBody(editor.getData());
                            }}
                        />
                    </div>

                    <div className='mt-2 border-b dark:border-white0 border border-slate-200' />
                    <div className='grid grid-cols-6 mt-1 mr-2'>
                        <Link href='/adminpanel/berita'>
                            <button type='button' className='px-2 py-2 mt-2 bg-yellow-500 rounded-md text-dark'>
                                Cancel
                            </button>
                        </Link>
                        <div className='col-span-4' />
                        <div className='flex justify-end'>
                            <button type='submit' className='px-2 py-2 mt-2 text-white rounded-md bg-accent'>
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
