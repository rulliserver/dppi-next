'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import InputLabel from '@/app/components/InputLabel';
import { UrlApi } from '@/app/components/apiUrl';
import Pagination from '@/app/components/Pagination';
import { BaseUrl } from '@/app/components/baseUrl';
import Swal from 'sweetalert2';
import { useUser } from '@/app/components/UserContext';


interface GalleryItem {
    id: number;
    kegiatan: string;
    foto: string | string[];
    keterangan: string;
    tanggal: string;
}

interface PaginatedResponse {
    data: GalleryItem[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}
function GaleriFoto() {
    const { user }: any = useUser();
    const [galeri, setGaleri]: any = useState<PaginatedResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);


    const getGaleri = (page: number = 1) => {
        setLoading(true);
        axios
            .get(`${UrlApi}/gallery?page=${page}&per_page=8`)
            .then((response: any) => {
                const processedData = {
                    ...response.data,
                    data: response.data.data.map((item: any) => ({
                        ...item,
                        foto: typeof item.foto === 'string' ? JSON.parse(item.foto) : item.foto,
                    }))
                };

                setGaleri(processedData);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching gallery data:', error);
                setLoading(false);
            });
    };
    useEffect(() => {
        getGaleri(currentPage);
    }, [currentPage]);
    const handlePageChange = (url: string, page: number) => {
        setCurrentPage(page);
        getGaleri(page);
    };

    const generateLinks = () => {
        if (!data) return [];

        const links = [];

        // Previous page link
        links.push({
            url: galeri.current_page > 1 ? `?page=${galeri.current_page - 1}` : null,
            label: '<<',
            active: false
        });

        for (let i = 1; i <= galeri.last_page; i++) {
            links.push({
                url: `?page=${i}`,
                label: i.toString(),
                active: i === galeri.current_page
            });
        }

        // Next page link
        links.push({
            url: galeri.current_page < galeri.last_page ? `?page=${galeri.current_page + 1}` : null,
            label: '>>',
            active: false
        });

        return links;
    };



    //tambah galeri foto
    const thumbsContainer: any = {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
    };

    const thumb: any = {
        display: 'inline-flex',
        borderRadius: 2,
        border: '1px solid #eaeaea',
        marginBottom: 8,
        marginRight: 8,
        width: 132,
        height: 90,
        padding: 4,
        boxSizing: 'border-box',
    };

    const thumbInner: any = {
        display: 'flex',
        minWidth: 0,
        overflow: 'hidden',
    };

    const img: any = {
        display: 'block',
        width: 'auto',
        height: '100%',
    };

    const [createModal, setCreateModal] = useState(false);
    const closeCreateModal = () => {
        setCreateModal(false);
    };
    const handleCreateGallery = () => {
        setCreateModal(true);
    };
    const [data, setData] = useState({
        kegiatan: '',
        keterangan: '',
        tanggal: '',
    });

    const handleCreateChange = (e: any) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const [files, setFiles] = useState([]);
    function Previews(props: any) {
        const { getRootProps, getInputProps } = useDropzone({
            accept: {
                'image/*': [],
            },
            onDrop: (acceptedFiles: any) => {
                setFiles(
                    acceptedFiles.map((file: any) =>
                        Object.assign(file, {
                            preview: URL.createObjectURL(file),
                        })
                    )
                );
            },
        });

        const thumbs = files.map((file: any) => (
            <div style={thumb} key={file.name}>
                <div style={thumbInner}>
                    <img
                        src={file.preview}
                        style={img}
                        // Revoke data uri after image is loaded
                        onLoad={() => {
                            URL.revokeObjectURL(file.preview);
                        }}
                    />
                </div>
            </div>
        ));

        useEffect(() => {
            // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
            return () => {
                files.forEach((file: any) => URL.revokeObjectURL(file.preview));
            };
        }, [files]);

        return (
            <section className='container px-2 my-2 border-gray-400 border-dashed rounded-md bg-slate-200 border-spacing-2 border dark:bg-dark'>
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps({ onChange: handleInputChange })} />
                    <p className='py-5 dark:text-white '>Drag 'n' drop beberapa foto ke sini, atau klik untuk memilih file foto</p>
                </div>
                <aside style={thumbsContainer}>{thumbs}</aside>
            </section>
        );
    }

    function handleInputChange(event: any) {
        const newFiles = Array.from(event.target.files).map((file: any) => {
            return Object.assign(file, {
                preview: URL.createObjectURL(file),
            });
        });
        setFiles((prevFiles: any) => prevFiles.concat(newFiles));
    }

    const handleFormSubmit = async (e: any) => {
        e.preventDefault();

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append(`foto[${i}]`, files[i]);
        }

        formData.append('kegiatan', data.kegiatan);
        formData.append('keterangan', data.keterangan);
        formData.append('tanggal', data.tanggal);
        formData.append('status', "Tayang");
        formData.append('created_by', user?.name);
        formData.append('updated_by', user?.name);
        setLoading(true);
        try {
            await axios.post(`${UrlApi}/adminpanel/galeri-foto`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            Swal.fire({
                icon: 'success',
                text: 'Galeri Foto Kegiatan berhasil ditambahkan',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/galeri-foto'
                }
            });
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
        setCreateModal(false);
    };
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [itemToDelete, setItemToDelete]: any = useState({ id: null, kegiatan: null });

    const handleButtonDelete = ({ id, kegiatan }: any) => {
        setItemToDelete({ id, kegiatan });
        setConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`${UrlApi}/adminpanel/galeri-foto/${itemToDelete.id}`, {
                withCredentials: true
            });
            Swal.fire({
                icon: 'success',
                text: 'Galeri Foto Kegiatan berhasil dihapus',
                showConfirmButton: true,
                confirmButtonText: 'OK',
                confirmButtonColor: '#2563eb',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/adminpanel/galeri-foto'
                }
            });
        } catch (error) {
            console.error(error);
        }
    };
    const handleCancelDelete = () => {
        setConfirmDelete(false);
        setItemToDelete({ id: null, kegiatan: null });
    };
    return (
        <div className='dark:bg-slate-900'>

            <div className='px-0 mx-auto mt-6 lg:px-4'>{loading && <div className='text-center text-slate-900 dark:text-slate-50'>Loading...</div>}</div>

            <p className='col-span-4 mx-2 my-auto mt-5 font-bold lg:text-xl dark:text-white'>Galeri Foto Kegiatan</p>
            <button onClick={handleCreateGallery} className='px-2 py-2 mt-3 text-xs font-semibold text-white rounded-md xl:text-base  bg-accent'>
                <i className='fas fa-plus-circle'> </i> Tambah Galeri Kegiatan
            </button>
            {galeri && galeri.data && !loading ? (
                <div className='px-0 mx-auto mt-2 rounded-md shadow-lg dark:bg-default lg:px-4 '>
                    <div className='py-2'>
                        <div className='grid grid-cols-4 gap-2 py-4 '>
                            {galeri.data.map((item: any) => {
                                return (
                                    <div key={item.id} className='overflow-hidden rounded-md'>
                                        <div className='flex justify-between px-2 py-2 bg-gray-900/50 translate-y-10'>
                                            <a href={`/adminpanel/galeri-foto/edit/${item.id}`}>
                                                <i className='mx-3 text-lg text-center text-green-500 fas fa-edit'></i>
                                            </a>
                                            <button onClick={() => handleButtonDelete(item)}>
                                                <i className='mx-3 text-lg text-center text-accent fas fa-trash'></i>
                                            </button>
                                        </div>
                                        <img className='object-cover h-56 overflow-hidden w-96' src={`${BaseUrl}uploads/assets/images/gallery/${item.foto[0]}`} alt='Foto Kegiatan' />
                                        <div className='h-16 text-sm text-center text-white -translate-y-16 bg-gray-900/50'>{item.kegiatan}</div>
                                    </div>
                                );
                            })}
                        </div>
                        {galeri.last_page > 1 && (
                            <div className='flex justify-center mt-8'>
                                <Pagination
                                    links={generateLinks()}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </div>) : !loading && (
                    <div className='flex justify-center py-8'>
                        <div className='text-lg'>Tidak ada data galeri</div>
                    </div>
                )}

            {createModal && (
                <div id='createModal' aria-hidden='true' className='fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                    <div className='relative w-full h-full max-w-3xl mx-auto top-20 md:h-auto'>
                        <div className='relative bg-white rounded-lg shadow-lg dark:bg-default'>
                            <div className='flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600'>
                                <div className='flex font-semibold text-gray-900 dark:text-white'>
                                    <span className='mr-1'>Tambah Foto Baru </span>
                                </div>

                                <button
                                    type='button'
                                    onClick={closeCreateModal}
                                    className='close-btn text-gray-400 hover:text-gray-900 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                    galerifoto-modal-hide='editModal'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <div className='border-b dark:border-white0 border border-slate-200'></div>

                            <div className='p-6 space-y-6'>
                                <form onSubmit={handleFormSubmit} encType='multipart/form-data'>
                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <InputLabel htmlFor='kegiatan' value='Kegiatan' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input
                                            className='col-span-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='text'
                                            name='kegiatan'
                                            onChange={handleCreateChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <InputLabel htmlFor='keterangan' value='Keterangan' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input
                                            className='col-span-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='text'
                                            name='keterangan'
                                            onChange={handleCreateChange}
                                        />
                                    </div>
                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <InputLabel htmlFor='tanggal' value='Tanggal Kegiatan' className='flex py-1 text-sm text-dark dark:text-white' />
                                        <input
                                            className='col-span-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-black'
                                            type='date'
                                            name='tanggal'
                                            onChange={handleCreateChange}
                                        />
                                    </div>

                                    {loading && <span className='mx-auto text-center text-accent'>Mohon menunggu photo sedang diupload...</span>}
                                    <Previews />
                                    <p className='text-sm text-accent'>*)maksimal 10 foto yang diupload</p>
                                    <div className='mt-2 border-b dark:border-white0 border border-slate-200'></div>
                                    <div className='grid grid-cols-3 mt-1 mr-2'>
                                        <button type='button' onClick={closeCreateModal} className='py-2 mt-2 bg-yellow-500 rounded-md text-dark'>
                                            Cancel
                                        </button>
                                        <div className=''></div>
                                        <button type='submit' className='py-2 mt-2 text-white rounded-md bg-accent'>
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className='fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full'>
                    <div className='relative w-full h-full max-w-3xl mx-auto top-20 md:h-auto'>
                        <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'></div>
                        <div className='col-span-5 px-3 mx-3 bg-gray-300 rounded-md shadow-md dark:bg-default shadow-red-100'>
                            <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'>
                                <button
                                    type='button'
                                    onClick={handleCancelDelete}
                                    className='close-btn text-accent hover:bg-accent  p-1.5 ml-auto inline-flex items-center hover:text-white rounded-full'
                                    delete-modal-hide='confirmDelete'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                                <div className='mt-4 font-bold text-center dark:text-white border-b border-dark'>
                                    Apakah anda yakin ingin menghapus foto-foto "{itemToDelete.kegiatan}"?
                                </div>
                                <div className='grid grid-cols-6 mt-1 mr-2 '>
                                    <button type='button' onClick={handleCancelDelete} className='px-2 py-2 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Cancel
                                    </button>
                                    <div className='col-span-4'></div>
                                    <div className='flex justify-end'>
                                        <button type='button' className='px-2 py-2 mt-2 text-white rounded-md bg-accent' onClick={handleConfirmDelete}>
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default GaleriFoto;
