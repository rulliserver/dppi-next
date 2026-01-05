// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import 'swiper/swiper-bundle.css';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { BaseUrl } from './baseUrl';
import Image from 'next/image';

export default function SlideBerita(props: any) {
    const berita = props.berita;

    return (
        <>
            {berita ? (
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    autoplay={{ delay: 7000 }}
                    pagination={{ clickable: true }}
                    navigation={false}
                    loop={true}
                >
                    {berita.slice(0, 3).map((item: any) => (
                        <SwiperSlide key={item.id}>
                            <div className='text-center px-auto mx-auto justify-center align-middle overflow-hidden bg-black'>
                                <a href={`/berita/${item.slug}`}>
                                    <Image className='w-full max-h-175 align-middle bg-no-repeat object-cover opacity-90' src={BaseUrl + `${item.photo}`} alt='photo berita' width={400} height={200} onError={(e: any) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/757575/000000?text=Gagal+Memuat+gambar" }} />
                                    <div className='absolute flex flex-col items-center w-full text-white text-sm md:text-xl lg:text-2xl bottom-0'>
                                        <div className='bg-black/70 w-full lg:py-4 py-1 lg:h-32'>
                                            <p className='text-center px-2 text-sm lg:text-lg md:font-semibold mb-5'>{item.title}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <></>
            )}
        </>
    );
}
