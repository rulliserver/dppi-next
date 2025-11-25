'use client'
import { useState, useEffect, useRef } from 'react';
import 'datatables.net-dt';
import $ from 'jquery';
import InputLabel from '@/app/Components/InputLabel';
import axios from 'axios';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import { canvasPreview } from '@/app/Components/CanvasPreview';
import { useDebounceEffect } from '@/app/Components/useDebounceEffect';
import { UrlApi } from '@/app/Components/apiUrl';
import { BaseUrl } from '@/app/Components/baseUrl';
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

function Regulasi() {
    //fetching Regulasi
    const [regulasi, setRegulasi] = useState();
    const [loading, setLoading]: any = useState(false);

    const getData = () => {
        axios
            .get(`${UrlApi}/regulasi`)
            .then((response: any) => {
                setRegulasi(response.data.data);

            })
            .catch((error) => {
                console.error('Error fetching regulasi data:', error);
            });
    };

    useEffect(() => {
        getData();
    }, [])

    //icon_regulasi
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const [crop, setCrop]: any = useState();
    const [completedCrop, setCompletedCrop]: any = useState();
    const [scale, setScale]: any = useState(1);
    const [rotate, setRotate]: any = useState(0);
    const [aspect, setAspect]: any = useState(7 / 10);

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

    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns: any = [
        { data: null, defaultContent: '', orderable: false },
        {
            data: null,

            render: function (data: any, type: any, row: any) {
                return `<img src=${BaseUrl + data.icon_regulasi} class="max-w-20 mx-auto p-0" />`;
            },
        },
        { data: 'nama_regulasi' },
        {
            data: null,
            render: function (data: any, type: any, row: any) {
                return `<a href=${UrlApi}/regulasi/view/${data.file_regulasi.split('/').pop()} target='_blank' rel='noopener noreferrer' class="text-blue-500 underline"> Lihat </a>`
            }
        },
        {
            data: null,
            render: function ({ data, row, type }: any) {
                return '<button class="text-success px-1 mx-1 rounded-sm edit-btn"><i class="fas fa-edit"></i></button><button class="delete-btn"><i class="text-danger px-1 mx-1 rounded-sm fas fa-trash"></button>';
            },
        },
    ];
    //Update regulasi pada tabel
    const [dataRegulasi, setdataRegulasi]: any = useState({
        id: '',
        file_regulasi: null,
        nama_regulasi: '',
        kategori_id: '',
    });

    const [deleteData, setDeleteData]: any = useState();
    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: regulasi,
            columns: columns,
            createdRow: function (row, data, dataIndex) {
                $(row)
                    .find('td')
                    .first()
                    .text(dataIndex + 1);
            },
        });

        $(tableRef.current).on('click', '.edit-btn', function () {
            var dataRegulasi = datatableRef.current.row($(this).parents('tr')).data();
            $('#editModal').removeClass('hidden');
            $('#nama_regulasiDeskripsi').text(dataRegulasi.nama_regulasi);
            setdataRegulasi({
                id: dataRegulasi.id,
                nama_regulasi: dataRegulasi.nama_regulasi,
                deskripsi: dataRegulasi.deskripsi,
                kategori_id: dataRegulasi.kategori_id,
            });
        });

        $(tableRef.current).on('click', '.delete-btn', function () {
            var deleteData = datatableRef.current.row($(this).parents('tr')).data();
            $('#deskripsiDelete').text(deleteData.nama_regulasi);
            setDeleteData({
                id: deleteData.id, //
            });
            $('#deleteModal').removeClass('hidden');
        });
        $('#editModal .close-btn').on('click', function () {
            $('#editModal').addClass('hidden');
        });
    }, [regulasi]);
    const closeEditModal = () => {
        window.location.reload();
    };
    const closeDeleteModal = () => {
        window.location.reload();
    };
    const [selectedFile, setSelectedFile]: any = useState(null);
    const handleFileSelect = (event: any) => {
        setSelectedFile(event.target.files[0]);
    };
    const handleChangeEdit = (e: any) => {
        setdataRegulasi({
            ...dataRegulasi,
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
                formData.append('icon_regulasi', croppedBlob);
            }
            formData.append('id', dataRegulasi.id);
            formData.append('file_regulasi', selectedFile);
            formData.append('nama_regulasi', dataRegulasi.nama_regulasi);
            await axios.put(`${UrlApi}/adminpanel/regulasi/${dataRegulasi.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            Swal.fire({
                icon: 'success',
                text: 'Regulasi berhasil diupdate',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/regulasi';
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    // TAMBAH DATA PADA TABEL
    const [tunggu, setTunggu] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const closeCreateModal = () => {
        window.location.reload();
    };
    const clickCreateHandle = () => {
        setCreateModal(true);
    };
    const [data, setData] = useState({
        nama_regulasi: '',
    });
    const [fileRegulasi, setFileRegulasi]: any = useState(null);
    const handleFileRegulasiSelect = (event: any) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            alert('Silakan unggah file PDF saja.');
            return;
        }
        setFileRegulasi(selectedFile);
    };
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
                formData.append('icon_regulasi', croppedBlob, 'icon_regulasi.png');
            }
            formData.append('nama_regulasi', data.nama_regulasi);
            if (fileRegulasi) {
                // Pastikan file PDF memiliki nama dan ekstensi yang benar
                formData.append('file_regulasi', fileRegulasi, fileRegulasi.name.endsWith('.pdf') ? fileRegulasi.name : `${fileRegulasi.name}.pdf`);
            }

            await axios.post(`${UrlApi}/adminpanel/regulasi`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });
            Swal.fire({
                icon: 'success',
                text: 'Regulasi berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/regulasi';
                }
            });
        } catch (error: any) {
            console.error('Error:', error);
            let errorMsg: any = 'Terjadi kesalahan saat mengunggah regulasi';
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
    const deleteSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await axios.delete(`${UrlApi}/adminpanel/regulasi/${deleteData.id}`, { withCredentials: true });
            Swal.fire({
                icon: 'success',
                text: 'Regulasi berhasil dihapus',
                showConfirmButton: true,
                confirmButtonText: 'Kembali',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/regulasi';
                }
            });
        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data regulasi',
            });
        }
    };
    return (
        <div className='bg-slate-50 dark:bg-slate-900'>
            <div className='flex flex-row justify-between'>
                <p className='mx-2 my-auto mt-5 font-bold text-accent lg:text-xl dark:text-white'>
                    <i className='fas fa-file-alt text-2xl'></i> Tabel Regulasi
                </p>
                <button className='py-1 px-2 mt-3 text-xs font-semibold text-white rounded-md xl:text-base xl:w-44 bg-accent' onClick={clickCreateHandle}>
                    <i className='fas fa-plus-circle'> </i> Tambah Regulasi
                </button>
            </div>

            {regulasi ?
                <div className='px-0 mx-auto mt-2 bg-white rounded-md shadow-lg dark:bg-default lg:px-4 '>
                    <div className='px-4 py-4 mx-auto text-xs 1xl:block 1xl:w-FULL 1xl:overflow-auto 2xl:text-base w-FULL'>
                        <table ref={tableRef} className='table datatable table-bordered w-FULL'>
                            <thead>
                                <tr>
                                    <th className='w-[5%]'>#</th>
                                    <th className='w-[15%]'>Icon</th>
                                    <th className='w-[45%]'>Nama Regulasi</th>
                                    <th className='w-[45%]'>File PDF</th>
                                    <th className='w-[15%]'>Aksi</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
                :
                <div className='px-0 mx-auto mt-6 colspan-2 lg:px-4'>{loading && <div className='text-slate-900 dark:text-slate-50'>Loading...</div>}</div>
            }


            {/* Edit Modal */}
            <div id='editModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 hidden p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                <div className='relative w-full h-full max-w-3xl mx-auto top-20 md:h-auto'>
                    <div className='relative bg-white rounded-lg shadow-lg dark:bg-default'>
                        <div className='flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600'>
                            <div className='flex font-semibold text-gray-900 dark:text-white'>
                                <span className='mr-1'>Edit Regulasi</span>
                            </div>

                            <button
                                type='button'
                                onClick={closeEditModal}
                                className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                regulasi-modal-hide='editModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <div className='border-b dark:border-white0 border border-slate-200'></div>

                        <div className='p-6 space-y-6'>
                            <form onSubmit={handleSubmit} encType='multipart/form-data'>
                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='icon_regulasi' value='Icon' className='flex py-1 text-sm text-dark dark:text-white' />
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
                                    <InputLabel htmlFor='nama_regulasi' value='Nama Regulasi' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                        type='text'
                                        defaultValue={dataRegulasi.nama_regulasi}
                                        onChange={handleChangeEdit}
                                        id='nama_regulasi'
                                        name='nama_regulasi'
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className='grid grid-cols-4 mt-1 mr-2'>
                                    <InputLabel htmlFor='file_regulasi' value='File' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input className='col-span-3 bg-white border-2 rounded-md dark:bg-black' type='file' accept='application/pdf' onChange={handleFileSelect} />
                                </div>
                                {errorMessage && <div className='text-sm text-accent error-message'>{errorMessage}</div>}
                                <p className='text-xs text-accent'>*) Abaikan jika tidak ada perubahan file</p>

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
                                    <span className='mr-1'>Tambah Regulasi </span>
                                </div>
                                {tunggu && <p className='dark:text-white text-center ml-12'>Tunggu sebentar, sedang proses menggunggah...</p>}
                                <button
                                    type='button'
                                    onClick={closeCreateModal}
                                    className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                    regulasi-modal-hide='editModal'>
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
                                        <InputLabel htmlFor='nama_regulasi' value='Nama Regulasi' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input
                                            className='col-span-3 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='text'
                                            onChange={handleCreateChange}
                                            id='nama_regulasi'
                                            name='nama_regulasi'
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className='grid grid-cols-4 mt-1 mr-2'>
                                        <InputLabel htmlFor='file_regulasi' value='File' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input
                                            className='col-span-3 bg-white border-2 rounded-md dark:bg-black'
                                            type='file'
                                            accept='application/pdf'
                                            onChange={handleFileRegulasiSelect}
                                            required
                                        />
                                    </div>
                                    <p className='text-xs text-accent mt-2'>*) FILE HARUS DALAM BENTUK PDF</p>
                                    {errorMessage && <div className='text-sm text-accent error-message'>{errorMessage}</div>}

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
                                regulasi-modal-hide='deleteModal'>
                                <i className='fas fa-times-circle'></i>
                            </button>
                        </div>
                        <div className='mt-4 px-8'>
                            <span className='dark:text-white'>Hapus</span>
                            <span id='deskripsiDelete' className='dark:text-white' />
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
export default Regulasi;
