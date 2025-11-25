'use client'
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import InputLabel from '@/app/components/InputLabel';
import { UrlApi } from '@/app/components/apiUrl';
import { useParams } from 'next/navigation';
import { BaseUrl } from '@/app/components/baseUrl';

type GalleryItem = {
    id: number;
    kegiatan: string;
    foto: string[];
    keterangan: string;
    tanggal: string;
};

function GaleriFotoEdit() {
    const { id } = useParams() as { id: string };

    const [galeri, setGaleri] = useState<GalleryItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [addPhoto, setAddPhoto] = useState(false);
    const [photos, setPhotos] = useState<string[]>([]);
    const [form, setForm] = useState<{ id: number | null; kegiatan: string; keterangan: string; tanggal: string; }>({
        id: null, kegiatan: '', keterangan: '', tanggal: ''
    });

    // --- helpers ---
    const toURL = (p: string) => new URL(p, BaseUrl).toString();
    const normalizeFotos = (raw: unknown): string[] => {
        if (Array.isArray(raw)) return raw.filter(Boolean) as string[];
        if (typeof raw === 'string' && raw.trim()) {
            try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr.filter(Boolean) : []; }
            catch { return [raw]; }
        }
        return [];
    };

    // --- fetch ---
    const getGaleri = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${UrlApi}/gallery/${id}`);
            const item = data?.[0];
            const fotoArr = normalizeFotos(item?.foto);

            const g: GalleryItem = {
                id: Number(item.id),
                kegiatan: item.kegiatan ?? '',
                keterangan: item.keterangan ?? '',
                tanggal: item.tanggal ?? '',
                foto: fotoArr,
            };
            setGaleri(g);
            setPhotos(fotoArr);
            setForm({ id: g.id, kegiatan: g.kegiatan, keterangan: g.keterangan, tanggal: g.tanggal });
        } catch (e) {
            console.error('Error fetching gallery data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getGaleri(); }, [id]);

    // --- form edit teks ---
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.id) return;

        try {
            const fd = new FormData();
            fd.append('id', String(form.id));
            fd.append('kegiatan', form.kegiatan);
            fd.append('keterangan', form.keterangan);
            fd.append('tanggal', form.tanggal);
            await axios.put(`${UrlApi}/adminpanel/galeri-foto/ubah/${form.id}`, fd, {
                withCredentials: true
            });
            await getGaleri();
        } catch (err) {
            console.error(err);
        }
    };

    // --- dropzone upload multiple ---
    const [files, setFiles] = useState<File[]>([]);
    const onDrop = (accepted: File[]) => {
        const withPreview = accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) })) as File[];
        setFiles(prev => [...prev, ...withPreview]);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 10,
        onDrop
    });

    useEffect(() => () => {
        files.forEach((f: any) => f.preview && URL.revokeObjectURL(f.preview));
    }, [files]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.id || files.length === 0) { setAddPhoto(false); return; }
        setLoading(true);
        try {
            const fd = new FormData();
            files.forEach((f, i) => fd.append('foto[]', f)); // konvensi umum array file

            await axios.put(`${UrlApi}/adminpanel/galeri-foto/update/${form.id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            setFiles([]);
            setAddPhoto(false);
            await getGaleri();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- delete foto (tanpa reload) ---
    const handleDeleteFoto = async (namaFile: string) => {
        if (!galeri) return;
        const ok = window.confirm(`Hapus foto "${namaFile}"?`);
        if (!ok) return;

        try {
            await axios.delete(`${UrlApi}/adminpanel/galeri-foto/delete/${galeri.id}/${encodeURIComponent(namaFile)}`, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            setPhotos(prev => prev.filter(f => f !== namaFile));
            setGaleri(prev => (prev ? { ...prev, foto: prev.foto.filter(f => f !== namaFile) } : prev));
        } catch (e) {
            console.error(e);
        }
    };

    // --- UI ---
    return (
        <div className='dark:bg-slate-900'>
            <div className='mx-auto'>
                <div className='relative bg-white rounded-lg shadow-lg dark:bg-default'>
                    {galeri && (
                        <>
                            <div className='flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white'>
                                    <span className='mr-1'>Update Foto Kegiatan</span>
                                    <div className='mr-1 text-accent'>{galeri.kegiatan}</div>
                                </div>
                                <a href='/adminpanel/galeri-foto' className='text-white bg-accent py-1 rounded-2xl px-3 focus:bg-red-900'>
                                    Kembali ke Galeri Foto
                                </a>
                            </div>

                            <div className='p-6 space-y-6'>
                                <form onSubmit={handleSubmit}>
                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <InputLabel htmlFor='kegiatan' value='Nama Kegiatan' className='flex py-1 text-dark dark:text-white' />
                                        <input
                                            className='col-span-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='text' name='kegiatan' value={form.kegiatan} onChange={handleChangeEdit} required
                                        />
                                    </div>

                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <InputLabel htmlFor='keterangan' value='Keterangan' className='flex py-1 text-dark dark:text-white' />
                                        <input
                                            className='col-span-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='text' name='keterangan' value={form.keterangan} onChange={handleChangeEdit}
                                        />
                                    </div>

                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <InputLabel htmlFor='tanggal' value='Tanggal Kegiatan' className='flex py-1 text-dark dark:text-white' />
                                        <input
                                            className='col-span-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='date' name='tanggal' value={form.tanggal} onChange={handleChangeEdit}
                                        />
                                    </div>

                                    <div className='flex justify-end'>
                                        <button className='p-2 mt-4 text-white bg-green-600 rounded-lg' type='submit' disabled={loading}>
                                            {loading ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>
                                </form>

                                <div className='flex items-center justify-between'>
                                    <InputLabel htmlFor='foto' value='Foto-Foto Kegiatan:' className='flex py-1 text-dark dark:text-white' />
                                    <button className='p-2 mt-4 text-white bg-red-500 rounded-lg' onClick={() => setAddPhoto(true)}>
                                        <i className='fas fa-plus-circle'></i> Tambah Foto
                                    </button>
                                </div>

                                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'>
                                    {photos.map((nama) => {
                                        const src = toURL(`uploads/assets/images/gallery/${nama}`);
                                        return (
                                            <div key={nama} className='group'>
                                                <div className='relative w-full aspect-4/3 overflow-hidden rounded-md bg-gray-100'>
                                                    <img src={src} alt='Foto Kegiatan' className='h-full w-full object-cover' loading='lazy' decoding='async' />
                                                </div>
                                                <div className='mt-2 flex flex-row-reverse'>
                                                    <button
                                                        type='button'
                                                        onClick={() => handleDeleteFoto(nama)}
                                                        aria-label={`Hapus foto ${nama}`}
                                                        className='p-1 rounded hover:bg-red-50'
                                                        title='Hapus foto'
                                                    >
                                                        <i className='fas fa-trash text-red-500'></i>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {addPhoto && (
                <div className='fixed inset-0 z-50 p-4 overflow-y-auto'>
                    <div className='relative w-full max-w-3xl mx-auto top-24'>
                        <div className='relative bg-gray-100 rounded-lg shadow-lg dark:bg-gray-700'>
                            <div className='flex items-center justify-between p-4 border-b dark:border-gray-600'>
                                <div className='font-semibold text-gray-900 dark:text-white'>Tambah Foto Baru</div>
                                <button type='button' onClick={() => setAddPhoto(false)} className='text-gray-500 hover:text-gray-900 p-1.5'>
                                    <i className='fas fa-times-circle' />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} encType='multipart/form-data' className='p-6 space-y-4'>
                                {loading && <span className='block text-center text-red-500'>Mohon menunggu, foto sedang diupload…</span>}

                                <section className='container px-2 my-2 border border-dashed border-gray-400 rounded-md bg-slate-200'>
                                    <div {...getRootProps({ className: 'cursor-pointer py-5 text-center dark:text-white' })}>
                                        <input {...getInputProps()} />
                                        <p>Drag 'n' drop beberapa foto ke sini, atau klik untuk memilih</p>
                                    </div>

                                    <aside className='flex flex-wrap gap-2 p-2'>
                                        {files.map((file: any) => (
                                            <div key={file.name} className='inline-flex w-[132px] h-[90px] border border-gray-300 rounded'>
                                                <img
                                                    src={file.preview}
                                                    alt={file.name}
                                                    className='object-cover w-full h-full'
                                                    onLoad={() => URL.revokeObjectURL(file.preview)}
                                                />
                                            </div>
                                        ))}
                                    </aside>
                                </section>

                                <p className='text-sm text-red-500'>*) maksimal 10 foto</p>

                                <div className='grid grid-cols-3 gap-2'>
                                    <button type='button' onClick={() => setAddPhoto(false)} className='py-2 bg-yellow-500 rounded-md text-dark'>Cancel</button>
                                    <div />
                                    <button type='submit' disabled={loading || files.length === 0} className='py-2 text-white rounded-md bg-accent'>
                                        {loading ? 'Mengunggah…' : 'Submit'}
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GaleriFotoEdit;
