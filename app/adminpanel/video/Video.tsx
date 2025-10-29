'use client';

import { UrlApi } from '@/app/Components/apiUrl';
import axios from 'axios';
import { useState } from 'react';

function Video() {
    const [loading, setLoading]: any = useState(true);
    const [error, setError]: any = useState(null);
    const [video, setVideo]: any = useState();
    const [tunggu, setTunggu]: any = useState(false);
    const [modalEdit, setModalEdit]: any = useState(false);
    const [edit, setEdit]: any = useState('');
    const [vid, setVid]: any = useState(null);
    const [confirmDelete, setConfirmDelete]: any = useState(false);
    const [itemToDelete, setItemToDelete]: any = useState({ id: null });

    const handleButtonDelete = ({ id }: any) => {
        setConfirmDelete(true);
        setItemToDelete({ id: id });
    };
    const getVideo = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${UrlApi}/video`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }
            console.log(response);

            let video = await response.json();
            video(video);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            video(null);
        } finally {
            setLoading(false);
        }
    };
    // const handleConfirmDelete = async () => {
    //     try {
    //         const response = await axios.delete(route('adminpanel.video.destroy', itemToDelete.id));
    //         console.log(response);
    //     } catch (error) {
    //         console.error(error);
    //     }
    //     window.location.reload();
    //     window.location.reload();
    // };
    // const handleCancelDelete = () => {
    //     setConfirmDelete(false);
    //     setItemToDelete({ id: null });
    // };
    // const cancelEdit = () => {
    //     window.location.reload();
    // };

    const handleClick: any = (id: number, vid: any) => {
        setModalEdit(true);
        setEdit({
            id: id,
        });
    };


    const handleChange = (e: any) => {
        setEdit({
            ...edit,
            [e.target.name]: e.target.value,
        });
    };

    const submit = async (e: any) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('file_video', file);
            formData.append('_method', 'put');
            // const response = await axios.post(route('adminpanel.video.update', edit.id), formData);
            // console.log(response);
        } catch (error) {
            console.error(error);
        }
        window.location.reload();
    };

    const [file, setFile]: any = useState(0);
    const handleFileChange = (e: any) => {
        setFile(e.target.files[0]);
    };

    const store = async (e: any) => {
        e.preventDefault();
        setTunggu(true);
        try {
            const formData = new FormData();

            formData.append('file_video', file);

            // const response = await axios.post(route('adminpanel.video.store'), formData);
            // console.log(response);
        } catch (error) {
            console.error(error);
        }
        window.location.reload();
        window.location.reload();
    };

    const [modalCreate, setModalCreate] = useState(false);
    const cancelCreate = () => {
        window.location.reload();
    };

    const handleCreateModal = () => {
        setModalCreate(true);
    };


    return (
        <>

            {/* <div className='flex justify-between'>
                <div className='px-2 py-2 text-dark dark:text-white'>
                    <div>
                        <i className='fas fa-th'></i> <b>VIDEO</b>
                    </div>
                </div>
                {video.length ? (
                    ''
                ) : (
                    <button className='px-2 py-2 text-white bg-accent rounded-md' onClick={handleCreateModal}>
                        Tambah Video
                    </button>
                )}
            </div>
            <div className='px-0 py-4 mx-auto mt-6 bg-white rounded-md shadow-lg dark:bg-gray-700 lg:px-4 dark:text-white'>
                {video.map((item: any, key: any) => {
                    return (
                        <div key={key} className='bg-gray-700 border-2 rounded-md border-inherit'>
                            <div className='px-2 text-center py-2'>
                                <video src={`/${item.file_video}`} controls className='mx-auto w-full h-full' />                               
                            </div>
                            <div className='col-span-2 px-2 py-2 text-white'>
                                <div className='flex flex-row justify-between'>
                                    <p></p>
                                    <div className='px-2'>
                                        <button className='px-2 py-2 mx-2 my-4 text-white bg-blue-500 rounded-md hover:bg-blue-800' onClick={() => handleClick(item.id)}>
                                            Edit Video
                                        </button>
                                        <button className='px-2 py-2 my-4 text-white rounded-md hover:bg-primary bg-accent' onClick={() => handleButtonDelete(item)}>
                                            Hapus Video
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className='justify-center py-6 mx-auto text-center px-auto'></div>
            </div> */}


            {/* {confirmDelete && (
                <div className='fixed top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto h-full '>
                    <div className='relative w-full h-full p-4 max-w-xl mx-auto top-20 md:h-auto shadow-sm'>
                        <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'></div>
                        <div className='col-span-5 px-3 mx-3 bg-gray-300 rounded-md shadow-md dark:bg-default shadow-red-100'>
                            <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'>
                                <button
                                    type='button'
                                    onClick={handleCancelDelete}
                                    className='close-btn text-accent hover:bg-accent rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:text-white'
                                    delete-modal-hide='confirmDelete'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                                <div className='mt-4 font-bold text-center dark:text-white border-b-1 border-dark'>Apakah anda yakin ingin menghapus Video ini?</div>
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
            {modalCreate && (
                <div className='fixed top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto h-full '>
                    <div className='relative w-full h-full bg-gray-100 p-4 max-w-xl mx-auto top-20 md:h-auto shadow-sm'>
                        <div className='flex flex-col'>
                            <div className='flex flex-row justify-between'>
                                {tunggu && <p className='text-center text-accent dark:text-white'>Video sedang diupload. Mohon menunggu...</p>}
                                <button
                                    type='button'
                                    onClick={cancelCreate}
                                    className='close-btn text-accent hover:bg-accent rounded-full p-1.5 ml-auto inline-flex items-center hover:text-white'
                                    delete-modal-hide='modalCreate'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <div className='border-b-2 border-gray-300 mb-4'></div>
                            <form onSubmit={store} encType='multipart/form-data'>
                                <div className='grid grid-cols-5 mt-1 mr-2'>
                                    <InputLabel htmlFor='file_video' value='File Video' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        type='file'
                                        accept='video/mp4,video/mov,video/ogg'
                                        className='col-span-4 text-sm border-accent border-1 bg-white dark:bg-dark ring-accent rounded-md shadow-sm focus:border-accent focus:ring-accent'
                                        onChange={handleFileChange}
                                        id='file_video'
                                        name='file_video'
                                    />
                                </div>
                                <div className='border-b-2 border-gray-300 mt-4'></div>
                                <div className='grid grid-cols-6 mt-1 mr-2 '>
                                    <button type='button' onClick={cancelCreate} className='px-2 py-1 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Cancel
                                    </button>
                                    <div className='col-span-4'></div>
                                    <div className='flex justify-end'>
                                        <button type='submit' className='px-2 py-1 mt-2 text-white rounded-md bg-accent'>
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'></div>
                </div>
            )}
            {modalEdit && (
                <div className='fixed top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto h-full'>
                    <div className='relative w-full h-full dark:bg-dark bg-gray-100 p-4 max-w-xl mx-auto top-20 md:h-auto shadow-sm'>
                        <div className='flex flex-col'>
                            <div className='flex flex-row justify-between'>
                                {tunggu && <p className='text-center text-accent dark:text-white'>Video sedang diupload. Mohon menunggu...</p>}
                                <button
                                    type='button'
                                    onClick={cancelEdit}
                                    className='close-btn text-accent hover:bg-accent rounded-full p-1.5 ml-auto inline-flex items-center hover:text-white'
                                    delete-modal-hide='modalCreate'>
                                    <i className='fas fa-times-circle'></i>
                                </button>
                            </div>
                            <div className='border-b-2 border-gray-300 mb-4'></div>
                            <form onSubmit={submit} encType='multipart/form-data'>
                                <div className='grid grid-cols-5 mt-1 mr-2'>
                                    <InputLabel htmlFor='file_video' value='File Video' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        type='file'
                                        accept='video/mp4,video/mov,video/ogg'
                                        className='col-span-4 text-sm border-accent border-1 bg-white dark:bg-dark ring-accent rounded-md shadow-sm focus:border-accent focus:ring-accent'
                                        onChange={handleFileChange}
                                        id='file_video'
                                        name='file_video'
                                    />
                                </div>
                                <div className='border-b-2 border-gray-300 mt-4'></div>
                                <div className='grid grid-cols-6 mt-1 mr-2 '>
                                    <button type='button' onClick={cancelEdit} className='px-2 py-1 mt-2 bg-yellow-500 rounded-md text-dark'>
                                        Cancel
                                    </button>
                                    <div className='col-span-4'></div>
                                    <div className='flex justify-end'>
                                        <button type='submit' className='px-2 py-1 mt-2 text-white rounded-md bg-accent'>
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className='flex flex-col p-4 border-b rounded-t dark:border-gray-600'></div>
                </div>
            )} */}
        </>
    );
}
export default Video;
