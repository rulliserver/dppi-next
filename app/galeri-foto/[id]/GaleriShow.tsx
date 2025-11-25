'use client';
import Pagination from '@/app/Components/Pagination';
import { useEffect, useState } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import axios from 'axios';
import { BaseUrl } from '@/app/Components/baseUrl';
import { UrlApi } from '@/app/Components/apiUrl';
import Image from 'next/image';
import { useParams } from 'next/navigation';


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


export default function GaleriShow() {
    const { id } = useParams();
    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [galeri, setGaleri]: any = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);


    const getGaleri = () => {
        setLoading(true);
        axios
            .get(`${UrlApi}/gallery/${id}`)
            .then((response: any) => {
                // console.log(response);
                const photo = response.data.map((item: any) => ({
                    ...item,
                    foto: JSON.parse(item.foto),
                }))
                setGaleri(photo[0]);
                // console.log(photo[0]);

                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching gallery data:', error);
                setLoading(false);
            });
    };
    const getData = (page: number = 1) => {
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

                setData(processedData);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching gallery data:', error);
                setLoading(false);
            });
    };

    const handlePageChange = (link: string, page: number) => {
        setCurrentPage(page);
        getData(page);

    };

    useEffect(() => {
        getGaleri();
        getData(currentPage);
    }, [currentPage]);

    const generateLinks = () => {
        if (!data) return [];

        const links = [];

        // Previous page link
        links.push({
            url: data.current_page > 1 ? `?page=${data.current_page - 1}` : null,
            label: '<<',
            active: false
        });

        for (let i = 1; i <= data.last_page; i++) {
            links.push({
                url: `?page=${i}`,
                label: i.toString(),
                active: i === data.current_page
            });
        }

        // Next page link
        links.push({
            url: data.current_page < data.last_page ? `?page=${data.current_page + 1}` : null,
            label: '>>',
            active: false
        });

        return links;
    };

    // Function untuk mendapatkan URL gambar
    const getImageUrl = (foto: string | string[]): string => {
        if (Array.isArray(foto) && foto.length > 0) {
            return `${BaseUrl}uploads/assets/images/gallery/${foto[0]}`;
        } else if (typeof foto === 'string') {
            return `${BaseUrl}uploads/assets/images/gallery/${foto}`;
        }
        return '/images/placeholder.jpg'; // Fallback image
    };



    const images = galeri?.foto.map((foto: any) => {
        return { original: `${BaseUrl}uploads/assets/images/gallery/${foto}`, thumbnail: `${BaseUrl}uploads/assets/images/gallery/${foto}` };
    });



    return (
        <>

            <div className='border-t-4 border-b-4 bg-primary border-secondary md:header'>
                <div className='mx-auto max-w-[1275px] px-2'>
                    <ul className='flex'>
                        <div className='py-2 mx-auto text-slate-50'>
                            <span>Galeri Foto Kegiatan {galeri && galeri.kegiatan}</span>
                        </div>
                    </ul>
                </div>
            </div>
            <div className='rounded-lg shadow-xl my-4 px-4 py-4 px-auto mx-auto max-w-[1275px] '>
                <div className='max-w-[1000px] mx-auto'>
                    {galeri ?
                        <ImageGallery items={images} showFullscreenButton={true} showThumbnails={true} autoPlay={false} />
                        : ''}
                </div>
            </div>

            <div className='font-bold text-center text-red-500 translate-y-10 mb-10'>GALERI KEGIATAN LAINNYA</div>
            {data && data.data && !loading ? (
                <>
                    <div className='max-w-[1360px] mx-auto'>
                        <div className='relative grid grid-cols-1 gap-4 px-4 mx-auto my-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                            {data.data.map((item: GalleryItem, key: number) => {
                                const imageUrl = getImageUrl(item.foto);

                                return (
                                    <div key={key} className="group">
                                        <a href={`/galeri-foto/${item.id}`} className="block">
                                            <div className='relative sm:mt-6 transition-transform duration-300 group-hover:scale-105'>
                                                <div className='w-full mx-auto overflow-hidden rounded-md shadow-md aspect-4/3'>
                                                    <Image
                                                        src={imageUrl}
                                                        alt={item.kegiatan}
                                                        width={400}
                                                        height={300}
                                                        className='w-full h-full object-cover'
                                                        placeholder='blur'
                                                        blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk9faLTyWwDdGWbqeSCO6FvKkJWWHPJADpN1qNVd4P/xAAaEQACAwAAAAAAAAAAAAAAAAAAEQESMkFR/9oACAECAQE/AGa5n//EABkRAQACAwAAAAAAAAAAAAAAAAEAAgMRE//aAAgBAwEBPwBTXbHk/9k='
                                                        sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                                                        onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/757575/000000?text=Gagal+Memuat+gambar" }}
                                                    />
                                                </div>
                                                <div className='absolute bottom-0 w-full mx-auto my-0 overflow-hidden text-center rounded-b-md'>
                                                    <div className='w-full py-3 px-2 my-0 text-xs text-center text-white bg-black/60 xl:text-sm font-bold transition-all duration-300 group-hover:bg-black/80'>
                                                        {item.kegiatan}
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {data.last_page > 1 && (
                            <div className='flex justify-center mt-8'>
                                <Pagination
                                    links={generateLinks()}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}

                        <div className='h-16'></div>
                    </div>
                </>
            ) : !loading && (
                <div className='flex justify-center py-8'>
                    <div className='text-lg'>Tidak ada data galeri</div>
                </div>
            )}
            <div className='xl:h-28 2xl:h-56'></div>

        </>
    );
}
