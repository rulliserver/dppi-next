'use client';

import { UrlApi } from '@/app/Components/apiUrl';
import { BaseUrl } from '@/app/Components/baseUrl';
import InputLabel from '@/app/Components/InputLabel';
import axios from 'axios';
import { useEffect, useState } from 'react';

function Video() {
    const [loading, setLoading]: any = useState(true);
    const [error, setError]: any = useState(null);
    const [video, setVideo]: any = useState();
    const [tunggu, setTunggu]: any = useState(false);
    const [modalEdit, setModalEdit]: any = useState(false);
    const [edit, setEdit]: any = useState('');

    const getVideo = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${UrlApi}/video`);
            if (!response.ok) {
                throw new error(`This is an HTTP error: The status is ${response.status}`);
            }

            let video = await response.json();
            setVideo(video);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const cancelEdit = () => {
        window.location.reload();
    };

    const handleClick: any = (id: number, vid: any) => {
        setModalEdit(true);
        setEdit({
            id: id,
        });
    };


    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return alert('Pilih file dulu');

        const fd = new FormData();
        fd.append('file', file);

        setLoading(true);
        try {
            const res = await fetch(`${UrlApi}/adminpanel/videos/${video[0].id}`, {
                method: 'PUT',
                body: fd,
                credentials: 'include', // penting kalau pakai HttpOnly cookie
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'Gagal upload');
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    const [file, setFile]: any = useState(0);
    const handleFileChange = (e: any) => {
        setFile(e.target.files[0]);
    };


    useEffect(() => {
        getVideo();
    }, []);
    return (
        <>

            <div className='flex justify-between'>
                <div className='px-2 py-2 text-dark dark:text-white'>
                    <div>
                        <i className='fas fa-th'></i> <b>VIDEO</b>
                    </div>
                </div>

            </div>
            <div className='px-0 py-4 mx-auto mt-6 bg-white rounded-md shadow-lg dark:bg-gray-700 lg:px-4 dark:text-white'>
                {video && video.map((item: any, key: any) => {
                    return (
                        <div key={key} className='bg-gray-700 border-2 rounded-md border-inherit'>
                            <div className='px-2 text-center py-2'>
                                <video src={`${BaseUrl}${item.file_video}`} controls className='mx-auto w-full h-full' />
                            </div>
                            <div className='col-span-2 px-2 py-2 text-white'>
                                <div className='flex flex-row justify-between'>
                                    <p></p>
                                    <div className='px-2'>
                                        <button className='px-2 py-2 mx-2 my-4 text-white bg-blue-500 rounded-md hover:bg-blue-800' onClick={() => handleClick(item.id)}>
                                            Edit Video
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className='justify-center py-6 mx-auto text-center px-auto'></div>
            </div>



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
                            <form onSubmit={onSubmit} encType='multipart/form-data'>
                                <div className='grid grid-cols-5 mt-1 mr-2'>
                                    <InputLabel htmlFor='file_video' value='File Video' className='flex py-1 text-sm text-dark dark:text-white' />
                                    <input
                                        type='file'
                                        accept='video/mp4,video/mov,video/ogg'
                                        className='col-span-4 text-sm border-accent border bg-white dark:bg-dark ring-accent rounded-md shadow-sm focus:border-accent focus:ring-accent'
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
            )}
        </>
    );
}
export default Video;
