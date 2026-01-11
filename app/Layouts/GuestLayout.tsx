'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UrlApi } from '../components/apiUrl';
import { v4 as uuidv4 } from 'uuid';
import SimpleVisitorStats from '../components/SimpleVisitorStats';
export default function GuestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    // Logika Scroll (Sudah Benar)
    const handleScroll = () => {
        const header: any = document.querySelector('.header');
        const fixedNav: any = header.offsetTop;
        const bgHamburger: any = document.getElementById('bg-hamburger');
        if (window.scrollY > fixedNav) {
            header.classList.add('navbar-fixed');
            bgHamburger.classList.add('bg-opacity-0');
        } else {
            header.classList.remove('navbar-fixed');
            bgHamburger.classList.remove('bg-opacity-5');
        }
    };

    // Data Setting (Sudah Benar)
    const [data, setData]: any = useState();
    const getDataSetting = () => {
        axios
            .get(`${UrlApi}/data-setting`)
            .then((response) => {
                setData(response.data.setting);
            })
            .catch((error) => {
                console.error('Error fetching data setting:', error);
            });
    };

    useEffect(() => {
        getDataSetting();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const hamburgerHandle = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    const slideoverContainerClass = isMenuOpen ? '' : 'invisible';
    const slideoverBGClass = isMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none';
    const slideoverTransformClass = isMenuOpen ? 'translate-x-0' : 'translate-x-full';
    const [sessionId, setSessionId] = useState<string>('');
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        // Initialize session
        const initSession = () => {
            // Cek semua storage

            const localStorageId = localStorage.getItem('visitor_session_id');
            const sessionStorageId = sessionStorage.getItem('visitor_session_id');

            let finalSessionId = localStorageId;

            if (!finalSessionId) {
                finalSessionId = uuidv4();
                // Set semua storage

                localStorage.setItem('visitor_session_id', finalSessionId);
                sessionStorage.setItem('visitor_session_id', finalSessionId);
            } else {
                // Sync across all storages

                if (!localStorageId) localStorage.setItem('visitor_session_id', finalSessionId);
                if (!sessionStorageId) sessionStorage.setItem('visitor_session_id', finalSessionId);
            }

            setSessionId(finalSessionId);
            return finalSessionId;
        };

        const currentSessionId = initSession();

        // Debounce logic
        const lastTrackKey = `last_track_${currentSessionId}`;
        const lastTrackTime = localStorage.getItem(lastTrackKey);
        const now = Date.now();

        // Minimal 1000 detik antara tracks untuk session yang sama
        if (lastTrackTime && (now - parseInt(lastTrackTime) < 1000000)) {
            console.log('⏸️  Skipping track (debounce)');
            return;
        }

        // Cek jika sudah track hari ini
        const todayKey = `tracked_today_${currentSessionId}`;
        const today = new Date().toDateString();
        const trackedToday = localStorage.getItem(todayKey);

        if (trackedToday === today && hasTracked) {
            console.log('📅 Already tracked today');
            return;
        }

        const trackVisit = async () => {
            const visitorData = {
                session_id: currentSessionId,
                page_url: window.location.href,
                referrer: document.referrer || undefined,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                is_new_session: !trackedToday,
                timestamp: new Date().toISOString(),
            };

            try {
                const response = await fetch(`${UrlApi}/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(visitorData),
                });

                if (response.ok) {
                    console.log('✅ Tracked successfully');
                    setHasTracked(true);
                    localStorage.setItem(lastTrackKey, Date.now().toString());
                    localStorage.setItem(todayKey, today);
                }
            } catch (error) {
                console.error('Failed to track:', error);
            }
        };

        trackVisit();
    }, []);


    return (
        <div className='bg-gray-50 dark:bg-gray-100'>
            <header className='top-0  left-0 z-20 flex items-center w-full header font-semibold text-red-700'>
                <nav className='nav is-sticky'>
                    <div className='top-nav'>
                        {/* Mobile Mode */}
                        <ul className='navbar-sm'>
                            <div>
                                <div className='flex justify-between p-0' id='bg-hamburger'>
                                    <div className='flex'>
                                        <a href='/' className='flex flex-row'>
                                            <img src='/assets/images/logo-bpip.png' alt='Logo BPIP' className='w-12 p-1 sm:hidden' onError={(e: any) => e.target.src = 'https://placehold.co/48x48/CCCCCC/333333?text=BPIP'} />
                                            <img src='/assets/images/logo-dppi.png' alt='Logo DPPI BPIP' className='w-12 p-1 sm:hidden' onError={(e: any) => e.target.src = 'https://placehold.co/48x48/CCCCCC/333333?text=DPPI'} />
                                            <img src='/assets/images/logo-paskibraka.png' alt='Logo Paskibraka' className='w-12 p-1 sm:hidden' onError={(e: any) => e.target.src = 'https://placehold.co/48x48/CCCCCC/333333?text=Pas'} />
                                        </a>
                                    </div>

                                    <div
                                        className={`hamburger ${isMenuOpen ? 'hamburger-active' : ''}`}
                                        onClick={hamburgerHandle}
                                        id='hamburger'
                                    >
                                        <span className='origin-top-left hamburger-line'></span>
                                        <span className='hamburger-line'></span>
                                        <span className='origin-bottom-left hamburger-line'></span>
                                    </div>
                                </div>
                                <div
                                    id='slideover-container'
                                    className={`fixed inset-0 z-10 h-full max-w-full md:hidden ${slideoverContainerClass}`}
                                >

                                    <div
                                        id='slideover-bg'
                                        className={`navbar-sm bg-gray-600/70 transition-opacity duration-300 ${slideoverBGClass}`}
                                        onClick={hamburgerHandle}
                                    ></div>

                                    {/* Slideover Panel */}
                                    <div
                                        id='slideover'
                                        className={`absolute right-0 w-full h-full transition-all duration-300 ease-out border-t-4 shadow-inner backdrop-blur-sm bg-opacity-80 border-secondary ${slideoverTransformClass}`}
                                    >
                                        <div className='bg-red-800/90 py-5 h-full mt-12 shadow-inner backdrop-blur-sm'>
                                            <ul className='relative leading-5 px-6'>

                                                <a href='/'>
                                                    <li onClick={hamburgerHandle} className={pathname === '/' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                        <span className='link link-underline link-underline-primary'> &#x2022; Beranda</span>
                                                    </li>
                                                </a>

                                                <a href='/profil'>
                                                    <li onClick={hamburgerHandle} className={pathname === '/profil' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                        <span className='link link-underline link-underline-primary'> &#x2022; Tentang DPPI</span>
                                                    </li>
                                                </a>
                                                <div className='flex flex-row pl-5'>
                                                    <div className='w-6 -translate-y-[0.6em] border-gray-400 border-b'></div>
                                                    <p className='text-gray-400'>&nbsp; Pelaksana</p>
                                                </div>
                                                <ul className='ml-5'>
                                                    <Link href='/pelaksana-pusat'>
                                                        <li className={pathname === '/pelaksana-pusat' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                            <span className='link link-underline link-underline-primary'> &#x2022; Pelaksana Pusat</span>
                                                        </li>
                                                    </Link>
                                                    <Link href='/pelaksana-provinsi'>
                                                        <li className={pathname === '/pelaksana-provinsi' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                            <span className='link link-underline link-underline-primary'> &#x2022; Pelaksana Provinsi</span>
                                                        </li>
                                                    </Link>
                                                    <Link href='/pelaksana-kabupaten'>
                                                        <li className={pathname === '/pelaksana-kabupaten' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                            <span className='link link-underline link-underline-primary'> &#x2022; Pelaksana Kabupaten</span>
                                                        </li>
                                                    </Link>
                                                </ul>
                                                <Link href='/galeri-foto'>
                                                    <li className={pathname === '/galeri-foto' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                        <span className='link link-underline link-underline-primary'> &#x2022; Galeri Foto</span>
                                                    </li>
                                                </Link>
                                                <div className='flex flex-row pl-5'>
                                                    <div className='w-6 -translate-y-[0.6em] border-gray-400 border-b'></div>
                                                    <p className='text-gray-500'>&nbsp; Informasi</p>
                                                </div>
                                                <ul className='ml-5'>
                                                    <Link href='/berita'>
                                                        <li className={pathname === '/berita' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                            <span className='link link-underline link-underline-primary'> &#x2022; Berita</span>
                                                        </li>
                                                    </Link>

                                                    <Link href='/kegiatan'>
                                                        <li className={pathname === '/kegiatan' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                            <span className='link link-underline link-underline-primary'> &#x2022; Kegiatan</span>
                                                        </li>
                                                    </Link>

                                                    <Link href='/regulasi'>
                                                        <li className={pathname === '/regulasi' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                            <span className='link link-underline link-underline-primary'> &#x2022; Regulasi</span>
                                                        </li>
                                                    </Link>
                                                </ul>

                                                <Link href='/kontak'>
                                                    <li className={pathname === '/kontak' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                        <span className='link link-underline link-underline-primary'> &#x2022; Kontak</span>
                                                    </li>
                                                </Link>
                                                <Link href='/webinar/'>
                                                    <li className={pathname === '/webinar/' ? 'py-1 text-yellow-500' : 'py-1 text-white'}>
                                                        <span className='link link-underline link-underline-primary'> &#x2022; Webinar</span>
                                                    </li>
                                                </Link>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ul>

                        {/* Desktop Mode */}
                        <div className='hidden transition duration-300 ease-in-out md:flex md:flex-row md:relative md:h-auto'>
                            <Link href='/' className='text-base navbar-link'>
                                <img src='/assets/images/logo-bpip.png' alt='Logo BPIP' className='invisible md:visible gov-image' />
                                <img src='/assets/images/logo-dppi.png' alt='Logo DPPI BPIP' className='invisible md:visible gov-image' />
                                <img src='/assets/images/logo-paskibraka.png' alt='Logo Paskibraka' className='invisible md:visible gov-image' />
                            </Link>

                            <ul className='mx-auto navbar'>
                                <Link href='/' className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>
                                    <li
                                        className={
                                            pathname === '/'
                                                ? 'whitespace-nowrap px-3 py-1 border-current border-b-2'
                                                : 'whitespace-nowrap px-3 py-1 rounded-sm link link-underline link-underline-primary'
                                        }>
                                        Beranda
                                    </li>
                                </Link>
                                <Link href='/profil' className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>
                                    <li
                                        className={
                                            pathname === '/profil'
                                                ? 'whitespace-nowrap px-3 py-1 border-current border-b-2'
                                                : 'whitespace-nowrap px-3 py-1 rounded-sm link link-underline link-underline-primary'
                                        }>
                                        Profil
                                    </li>
                                </Link>

                                <div className='inline-block group'>
                                    <button className='flex items-center px-3 py-1 outline-none focus:outline-none'>
                                        <span className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>Pelaksana</span>
                                        <span>
                                            <svg
                                                className='w-4 h-4 transition duration-150 ease-in-out transform fill-current group-hover:rotate-180'
                                                xmlns='http://www.w3.org/2000/svg'
                                                viewBox='0 0 20 20'>
                                                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                                            </svg>
                                        </span>
                                    </button>
                                    <ul className='bg-white shadow-lg px-4 dropdown-menu-header shadow-gray-500 border-t-6 border-secondary'>
                                        <Link href='/pelaksana-pusat'>
                                            <li className='py-1 text-primary'>
                                                <span className='link link-underline link-underline-primary'>Pelaksana Pusat</span>
                                            </li>
                                        </Link>
                                        <Link href='/pelaksana-provinsi'>
                                            <li className='py-1 text-primary'>
                                                <span className='link link-underline link-underline-primary'>Pelaksana Provinsi</span>
                                            </li>
                                        </Link>
                                        <Link href='/pelaksana-kabupaten'>
                                            <li className='py-1 text-primary'>
                                                <span className='link link-underline link-underline-primary'>Pelaksana Kabupaten/Kota</span>
                                            </li>
                                        </Link>
                                    </ul>
                                </div>
                                <Link href='/galeri-foto' className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>
                                    <li
                                        className={
                                            /^\/galeri-foto(\/.*)?$/.test(pathname)
                                                ? 'whitespace-nowrap px-3 py-1 border-current border-b-2'
                                                : 'whitespace-nowrap px-3 py-1 rounded-sm link link-underline link-underline-primary'
                                        }>
                                        Galeri
                                    </li>
                                </Link>

                                <div className='inline-block group'>
                                    <button className='flex items-center px-3 py-1 outline-none focus:outline-none'>
                                        <span className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>Informasi</span>
                                        <span>
                                            <svg
                                                className='w-4 h-4 transition duration-150 ease-in-out transform fill-current group-hover:rotate-180'
                                                xmlns='http://www.w3.org/2000/svg'
                                                viewBox='0 0 20 20'>
                                                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                                            </svg>
                                        </span>
                                    </button>
                                    <ul className='bg-white shadow-lg px-2 dropdown-menu-header shadow-gray-500 border-t-6 border-secondary'>
                                        <Link href='/berita'>
                                            <li className='py-1 text-primary'>
                                                <span className='link link-underline link-underline-primary'>Berita</span>
                                            </li>
                                        </Link>
                                        <Link href='/kegiatan'>
                                            <li className='py-1 text-primary'>
                                                <span className='link link-underline link-underline-primary'>Kegiatan</span>
                                            </li>
                                        </Link>
                                        <Link href='/regulasi'>
                                            <li className='py-1 text-primary'>
                                                <span className='link link-underline link-underline-primary'>Regulasi</span>
                                            </li>
                                        </Link>
                                    </ul>
                                </div>

                                <Link href='/kontak' className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>
                                    <li
                                        className={
                                            pathname === '/kontak'
                                                ? 'whitespace-nowrap px-3 py-1 border-current border-b-2'
                                                : 'whitespace-nowrap px-3 py-1 rounded-sm link link-underline link-underline-primary'
                                        }>
                                        Kontak
                                    </li>
                                </Link>
                                <Link href='/webinar/' className='flex-1 py-2 pr-1 text-xs md:text-sm lg:text-base'>
                                    <li
                                        className={
                                            pathname === '/webinar/'
                                                ? 'whitespace-nowrap px-3 py-1 border-current border-b-2'
                                                : 'whitespace-nowrap px-3 py-1 rounded-sm link link-underline link-underline-primary'
                                        }>
                                        Webinar
                                    </li>
                                </Link>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <div className='min-h-screen bg-gray-50 dark:bg-gray-900 '>{children}</div>

            <footer className='mb-auto text-white '>
                <div className='z-10 items-center w-full border-b-4 md:block border-secondary bg-red-700 header'>
                    <div className='block py-2 max-w-317.5 md:grid md:grid-cols-3 md:gap-16 mx-auto'>
                        <div className='col-span-1 my-auto'>
                            <a className='flex px-2' href='/'>
                                <img src='/assets/images/logo-bpip.png' alt='Logo BPIP' className='gov-image' />
                                <img src='/assets/images/logo-dppi.png' alt='Logo DPPI BPIP' className='gov-image' />
                                <img src='/assets/images/logo-paskibraka.png' alt='Logo Paskibraka' className='gov-image' />
                            </a>
                            <p className='ml-3 mt-3 font-semibold'>DPPI BPIP RI</p>

                            {data ? (
                                <div className='m-4'>
                                    <p className='text-xs '>{data.alamat} </p>
                                    <p className='text-xs '>
                                        Telp. {data.telepon} | E-mail {data.email}
                                    </p>
                                </div>
                            ) : (
                                <>loading...</>
                            )}
                        </div>
                        <div className='grid w-full grid-cols-1 lg:grid-cols-2 lg:col-span-2'>
                            <div className='flex flex-col'>
                                <p className='mb-4 font-bold text-center '>Ikuti Sosial Media Kami:</p>
                                {data ? (
                                    <div className='flex flex-row px-4 mx-auto mb-5'>
                                        <a href={data.instagram} target='_blank' rel='noopener noreferrer' className='flex'>
                                            <img src='/assets/images/ig.png' className='w-8 h-8 mr-4' />
                                        </a>

                                        <a href={data.facebook} target='_blank' rel='noopener noreferrer' className='flex'>
                                            <img src='/assets/images/fb.png' className='w-8 h-8 mr-4' />
                                        </a>

                                        <a href={data.x} target='_blank' rel='noopener noreferrer' className='flex'>
                                            <img src='/assets/images/tweeter.png' className='w-8 h-8 mr-4' />
                                        </a>

                                        <a href={data.youtube} target='_blank' rel='noopener noreferrer' className='flex'>
                                            <img src='/assets/images/youtube.png' className='w-8 h-8 mr-4' />
                                        </a>

                                        <a href={data.tiktok} target='_blank' rel='noopener noreferrer' className='flex'>
                                            <img src='/assets/images/tiktok.png' className='w-8 h-8 mr-4' />
                                        </a>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                            <div className="mt-8">

                                <SimpleVisitorStats />
                            </div>
                        </div>


                    </div>
                    <div className='flex justify-center mx-auto mb-4 text-xs text-center '>
                        <p>DPPI BPIP RI ©2025 All Rights Reserved </p>
                    </div>
                </div>

            </footer>
        </div>
    );
}
