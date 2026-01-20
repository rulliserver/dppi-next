'use client'
import { useState, useEffect, useRef } from 'react';
import InputLabel from '@/app/components/InputLabel';
import axios from 'axios';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import { canvasPreview } from '@/app/components/CanvasPreview';
import { useDebounceEffect } from '@/app/components/useDebounceEffect';
import { UrlApi } from '@/app/components/apiUrl';
import { BaseUrl } from '@/app/components/baseUrl';
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

function Pengumuman() {
    //fetching Pengumuman
    const [pengumuman, setPengumuman]: any = useState();
    const [loading, setLoading]: any = useState(false);

    const getData = () => {
        axios.get(`${UrlApi}/pengumuman`)
            .then((response: any) => {
                if (response.data) {
                    setPengumuman(
                        response.data.announce
                    );
                } else {
                    setPengumuman(null);
                }
            })
            .catch((error) => {
                console.error('Error fetching pengumuman:', error);
                setPengumuman(null);
            });
    };

    useEffect(() => {
        getData();
    }, [])

    //image
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop]: any = useState();
    const [completedCrop, setCompletedCrop]: any = useState();
    const [scale, setScale]: any = useState(1);
    const [rotate, setRotate]: any = useState(0);
    const [aspect, setAspect]: any = useState(25 / 14);

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
            const { width, height }: any = e.currentTarget;
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


    //Update pengumuman pada tabel
    const clickEditHandle = () => {
        setdataPengumuman({
            id: pengumuman.id,
            image: pengumuman.image,
            link: pengumuman.link,
        });
        const editModal: any = document.getElementById('editModal');
        editModal.classList.remove('hidden');
    }

    const [dataPengumuman, setdataPengumuman]: any = useState({
        id: '',
        image: null,
        link: '',
    });

    const [deleteData, setDeleteData]: any = useState();

    const closeEditModal = () => {
        window.location.reload();
    };
    const closeDeleteModal = () => {
        window.location.reload();
    };

    const handleChangeEdit = (e: any) => {
        setdataPengumuman({
            ...dataPengumuman,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            if (previewCanvasRef.current) {
                const canvas: any = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('image', croppedBlob);
            }
            formData.append('id', dataPengumuman.id);
            formData.append('link', dataPengumuman.link);
            await axios.put(`${UrlApi}/adminpanel/pengumuman/${dataPengumuman.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            Swal.fire({
                icon: 'success',
                text: 'Pengumuman berhasil diupdate',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/pengumuman';
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    // TAMBAH DATA PENGUMUMAN
    const [tunggu, setTunggu] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const closeCreateModal = () => {
        window.location.reload();
    };
    const clickCreateHandle = () => {
        setCreateModal(true);
    };
    const [data, setData] = useState({
        link: '',
    });

    const handleCreateChange = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const [errorMessage, setErrorMessage] = useState(null);

    const submit = async (e: any) => {
        e.preventDefault();
        setTunggu(true);
        setLoading(true);
        setErrorMessage(null);

        try {
            const formData = new FormData();
            if (previewCanvasRef.current) {
                const canvas: any = previewCanvasRef.current;
                const croppedBlob: any = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
                formData.append('image', croppedBlob, 'image.png');
            }
            formData.append('link', data.link);

            await axios.post(`${UrlApi}/adminpanel/pengumuman`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            Swal.fire({
                icon: 'success',
                text: 'Pengumuman berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/pengumuman';
                }
            });
        } catch (error: any) {
            console.error('Error:', error);
            let errorMsg: any = 'Terjadi kesalahan saat mengunggah pengumuman';
            if (error.response?.data?.errors) {
                errorMsg = Object.values(error.response.data.errors).flat().join(', ');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            setErrorMessage(errorMsg);

            Swal.fire({
                icon: 'error',
                text: errorMsg,
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            });
        } finally {
            setLoading(false);
            setTunggu(false);
        }
    };

    // DELETE DATA
    const clickDeleteHandle = () => {
        setDeleteData({
            id: pengumuman.id,
            link: pengumuman.link,
        });
        const deleteModal: any = document.getElementById('deleteModal');
        deleteModal.classList.remove('hidden');
    }
    const deleteSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await axios.delete(`${UrlApi}/adminpanel/pengumuman/${deleteData.id}`, { withCredentials: true });
            Swal.fire({
                icon: 'success',
                text: 'Pengumuman berhasil dihapus',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/pengumuman';
                }
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data pengumuman',
            });
        }
    };

    return (
        <div className='bg-slate-50 dark:bg-slate-900'>
            <div className='flex flex-row justify-between'>
                <p className='mx-2 my-auto mt-5 font-bold text-accent lg:text-xl dark:text-white'>
                    <i className='fas fa-info mr-2 text-2xl'></i> Pengumuman
                </p>
                {pengumuman ? "" :
                    <button className='py-1 px-2 mt-3 text-xs font-semibold text-white rounded-md xl:text-base xl:w-44 bg-accent' onClick={clickCreateHandle}>
                        <i className='fas fa-plus-circle'> </i> Tambah Pengumuman
                    </button>
                }
            </div>

            {pengumuman ?
                (<div>
                    <p className="text-center dark:text-white font-semibold">PENGUMUMAN</p>
                    <img src={BaseUrl + pengumuman?.image} alt="Pengumuman" width={600} className='mx-auto' />
                    <p className='text-center '>link pengumuman : {pengumuman?.link}</p>
                    <div className="flex flex-row justify-end gap-4 my-4">
                        <button onClick={clickEditHandle} className='bg-green-700 text-white rounded-xl px-4 py-1'>Edit</button>
                        <button onClick={clickDeleteHandle} className='bg-red-700 text-white rounded-xl px-4 py-1'>Hapus</button>

                    </div>
                </div>)
                : <p className='text-center dark:text-white'>Tidak ada data pengumuman</p>
            }
            {/* Edit Modal */}
            <div id='editModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-4xl mx-auto top-20 md:h-auto'>
                    <div className='relative bg-white rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1'>Edit Pengumuman</span>
                            </div>

                            <button
                                type='button'
                                onClick={closeEditModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                pengumuman-modal-hide='editModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <div className='border-b dark:border-white0 border border-slate-200'></div>

                        <div className='p-6 space-y-6'>
                            <form onSubmit={handleSubmit} encType='multipart/form-data'>
                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='image' value='Icon' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input className='col-span-3 bg-white border-2 rounded-md dark:bg-black' type='file' accept='image/*' onChange={onSelectFile} />
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

                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='link' value='Link Pengumuman' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                        type='text'
                                        defaultValue={dataPengumuman.link}
                                        onChange={handleChangeEdit}
                                        id='link'
                                        name='link'
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                                <div className='grid grid-cols-3 mt-1 mr-2'>
                                    <button className='col-start-3 p-2 rounded-lg bg-success hover:bg-green-600' type='submit'>
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* Create Modal */}
            {createModal && (
                <div id='createModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-40 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                    <div className='relative w-full h-full max-w-3xl mx-auto top-8 md:h-auto'>
                        <div className='relative bg-white rounded-lg shadow-lg dark:bg-default'>
                            <div className='flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white'>
                                    <span className='mr-1'>Tambah Pengumuman </span>
                                </div>
                                {tunggu && <p className='dark:text-white text-center ml-12'>Tunggu sebentar, sedang proses menggunggah...</p>}
                                <button
                                    type='button'
                                    onClick={closeCreateModal}
                                    className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                    pengumuman-modal-hide='editModal'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <div className='border-b dark:border-white0 border border-slate-200'></div>

                            <div className='p-6 space-y-6'>
                                <form onSubmit={submit} encType='multipart/form-data'>
                                    <div className='grid grid-cols-4 mt-1 mr-2'>
                                        <InputLabel htmlFor='picture' value='Icon' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input className='col-span-3 bg-white border-2 rounded-md dark:bg-black' type='file' accept='image/*' onChange={onSelectFile} />
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
                                    <div className='grid grid-cols-4 mt-1 mr-2'>
                                        <InputLabel htmlFor='link' value='Nama Pengumuman' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input
                                            className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='text'
                                            onChange={handleCreateChange}
                                            id='link'
                                            name='link'
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                                    <div className='mx-2 flex justify-between'>
                                        <button type='button' onClick={closeCreateModal} className='py-2 px-8 mt-2 bg-yellow-500 hover:bg-yellow-600 rounded-md text-dark'>
                                            Cancel
                                        </button>

                                        <button type='submit' className='py-2 mt-2 px-8 text-white rounded-md bg-accent hover:bg-red-700'>
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* delete Modal */}

            <div id='deleteModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-xl mx-auto top-20 md:h-auto rounded-lg dark:border dark:border-white round'>
                    <div className='relative bg-white rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between px-4 pt-2 border-b rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1 text-accent'>Hapus Data </span>
                            </div>

                            <button
                                type='button'
                                onClick={closeDeleteModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                pengumuman-modal-hide='deleteModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <div className='mt-4 px-8'>
                            <span className='dark:text-white'>Hapus pengumuman ini</span>

                            <span></span>?
                        </div>

                        <div className='mt-2 border-b'></div>
                        <div className='px-4'>
                            <form onSubmit={deleteSubmit} encType='multipart/form-data'>
                                <div className='grid grid-cols-3 mt-1 mr-2 pb-4'>
                                    <button type='button' onClick={closeDeleteModal} className='py-2 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Batal
                                    </button>
                                    <div className=''></div>
                                    <button type='submit' className='py-2 mt-2 text-white rounded-md bg-accent'>
                                        HAPUS
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Pengumuman;
