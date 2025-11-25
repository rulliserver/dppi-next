// app/adminpanel/berita/BeritaCreate.tsx
'use client';

import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import InputLabel from '@/app/components/InputLabel';
import axios from 'axios';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import { canvasPreview } from '@/app/components/CanvasPreview';
import { BaseUrl } from '@/app/components/baseUrl';
import { UrlApi } from '@/app/components/apiUrl';
import Link from 'next/link';
import { useUser } from '@/app/components/UserContext';
import Swal from 'sweetalert2';

function centerAspectCrop(mediaWidth: any, mediaHeight: any, aspect: any) {
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

export default function BeritaCreate() {
    const { user }: any = useUser()
    const [newsCategories, setNewsCategories] = useState()
    const [data, setData]: any = useState({
        photo: null,
        title: '',
        news_category: 1,
        category_id: 1,
        body: '',
        tanggal: new Date(),
        caption: '',
        author: '',
        status: 0,
        sumber: '',
    });
    console.log(data);

    const [body, setBody] = useState('');
    console.log(body);
    const getCategory = async () => {
        try {
            const res = await axios.get(`${UrlApi}/adminpanel/kategori-berita`, {
                withCredentials: true,
            });
            setNewsCategories(res.data);
            console.log(newsCategories);

        } catch (err) {
            console.error('getPost error:', err);
        }
    };


    const handleChange = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
        setBody(data.body);
    };

    const [imgSrc, setImgSrc]: any = useState('');
    const previewCanvasRef: any = useRef(null);
    const imgRef: any = useRef(null);
    const [crop, setCrop]: any = useState();
    const [completedCrop, setCompletedCrop]: any = useState();
    const scale = 1;
    const rotate = 0;
    const aspect = 16 / 9;

    function onSelectFile(e: any) {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Makes crop preview update between images.
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

    const submit = async (e: any) => {
        e.preventDefault();
        if (previewCanvasRef.current) {
            const canvas = previewCanvasRef.current;
            const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.5));
            try {
                const formData = new FormData();
                formData.append('photo', croppedBlob);
                formData.append('title', data.title);
                formData.append('caption', data.caption);
                formData.append('tanggal', data.tanggal);
                formData.append('news_category', data.news_category);
                formData.append('category_id', data.category_id);
                formData.append('author', data.author);
                formData.append('sumber', data.sumber);
                formData.append('status', data.status);
                formData.append('user_id', user.id);
                formData.append('created_by', user.name);
                formData.append('body', body);
                await axios.post(`${UrlApi}/adminpanel/berita`, formData, {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                Swal.fire({
                    icon: 'success',
                    text: 'Berita berhasil disimpan',
                    showConfirmButton: true,
                    confirmButtonText: 'Kembali ke Data Berita',
                    confirmButtonColor: '#2563eb',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/adminpanel/berita';
                    }
                });
            } catch (error) {
                console.error(error);
            }

        }
    };
    return (
        <div>
            <div className='block'>
                <div className='px-2 py-2 text-dark dark:text-white'>
                    <i className='fas fa-th'></i> Tambah Berita
                </div>
            </div>

            <div className='flex flex-col p-4  rounded-t '></div>
            <div className='col-span-5 px-3 mx-3 bg-gray-300 rounded-md shadow-md dark:bg-default shadow-red-100'>
                <form onSubmit={submit} encType='multipart/form-data' className='py-4 mx-2'>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='title' value='Judul Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 bg-white text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleChange}
                            id='title'
                            name='title'
                            required
                        />
                    </div>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='picture' value='Gambar' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input className='col-span-4 px-2 py-1 bg-white border-2 rounded-md' type='file' accept='image/*' onChange={onSelectFile} required />
                    </div>
                    <div className='grid grid-cols-2 gap-4 mx-48 my-2'>
                        {Boolean(imgSrc) && (
                            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect}>
                                <img ref={imgRef} alt='Crop me' src={imgSrc} style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }} onLoad={onImageLoad} />
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
                                        height: completedCrop.height,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='caption' value='Caption Gambar' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 bg-white text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleChange}
                            id='caption'
                            name='caption'
                        />
                    </div>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='sumber' value='Sumber Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 bg-white text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleChange}
                            id='sumber'
                            name='sumber'
                        />
                    </div>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='author' value='Author Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-4 bg-white text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='text'
                            onChange={handleChange}
                            id='author'
                            name='author'
                            required
                        />
                    </div>
                    <div className='grid grid-cols-5 mt-1 mr-2'>
                        <InputLabel htmlFor='tanggal' value='Tanggal Rilis' className='flex py-1 text-sm text-dark dark:text-white' />
                        <input
                            className='col-span-1 text-sm border-gray-300 bg-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'
                            type='date'
                            onChange={handleChange}
                            id='tanggal'
                            name='tanggal'
                        />
                    </div>
                    {user.role === 'Superadmin' || user.role === 'Administrator' ? (
                        <div className='grid grid-cols-5 mt-1 mr-2'>
                            <InputLabel htmlFor='status' value='Status Berita' className='flex py-1 text-sm text-dark dark:text-white' />
                            <select
                                name='status'
                                id='status'
                                required
                                onChange={handleChange}
                                className='col-span-1 text-sm border-gray-300 bg-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'>
                                <option value='0'>Belum disetujui</option>
                                <option value='1'>Disetujui</option>
                                <option value='2'>Ditolak</option>
                            </select>
                        </div>
                    ) : (
                        <div className='hidden'>
                            <InputLabel htmlFor='status' value='Status Berita' className='bg-white flex py-1 text-sm text-dark dark:text-white' />
                            <select
                                name='status'
                                id='status'
                                required
                                onChange={handleChange}
                                className='col-span-1 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-dark'>
                                <option value='0'>Belum disetujui</option>
                                <option value='1'>Disetujui</option>
                                <option value='2'>Ditolak</option>
                            </select>
                        </div>
                    )}
                    <InputLabel htmlFor='body' value='Isi Content:' className='flex py-2 mt-2 text-sm text-dark dark:text-white' />
                    <div className='bg-white dark:bg-dark'>
                        <CKEditor
                            onReady={(editor: any) => {
                                editor.ui.getEditableElement().parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement());
                            }}
                            editor={DecoupledEditor as any}
                            data={data.body}
                            config={{
                                toolbar: ['undo', 'redo', '|', 'bold', 'italic', 'underline', '|', 'bulletedList', 'numberedList'],
                            }}
                            onChange={(_, editor) => {
                                setBody(editor.getData());
                            }}
                        />
                    </div>
                    <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                    <div className='grid grid-cols-6 mt-1 mr-2'>
                        <Link href='/adminpanel/berita'>
                            <button type='button' className='px-2 py-2 mt-2 bg-yellow-500 rounded-md text-dark'>
                                Cancel
                            </button>
                        </Link>
                        <div className='col-span-4 '></div>
                        <div className='flex justify-end'>
                            <button type='submit' className='px-2 py-2 mt-2 text-white rounded-md bg-accent'>
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
}
