'use client';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { UrlApi } from '../components/apiUrl';
import { BaseUrl } from '../components/baseUrl';
import darkMode from '../components/DarkMode';
import Dropdown from '../components/Dropdown';
import { useUser } from '../components/UserContext';
import Link from 'next/link';
import axios from 'axios';
import DownloadCVButton from '../components/DownloadCVButton';
import LoadingIndikator from '../components/loadingIndikator';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, setUser } = useUser();
    const [authPdp, setAuthPdp]: any = useState();
    const [pendidikan, setPendidikan] = useState<any[]>([]);
    const [organisasi, setOrganisasi] = useState<any[]>([]);
    const [colorTheme, setTheme] = darkMode();
    const [isColaps, setColaps] = useState(false);

    // Refs
    const sidebarRef = useRef<HTMLDivElement>(null);
    const appNameRef = useRef<HTMLParagraphElement>(null);
    const topbarRef = useRef<HTMLDivElement>(null);
    const mainContentRef = useRef<HTMLElement>(null);

    const menuRefs = {
        menuName: useRef<HTMLParagraphElement>(null),
        menuName1: useRef<HTMLParagraphElement>(null),
        menuName2: useRef<HTMLParagraphElement>(null),
        menuName3: useRef<HTMLParagraphElement>(null),
        menuName4: useRef<HTMLParagraphElement>(null),
        menuName5: useRef<HTMLParagraphElement>(null),
    };

    const hamburgerRefs = {
        hamburgerAdmin: useRef<HTMLDivElement>(null),
        slideoverContainer: useRef<HTMLDivElement>(null),
        slideoverBG: useRef<HTMLDivElement>(null),
        slideover: useRef<HTMLDivElement>(null),
        header: useRef<HTMLElement>(null),
        bgHamburger: useRef<HTMLDivElement>(null),
    };

    // Fetch user data
    const fetchUser = async () => {
        try {
            const res = await fetch(`${UrlApi}/user`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (res.status === 401) {
                window.location.href = '/auth/login';
                return;
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            setUser(data);
            if (data.role === 'Superadmin' || data.role === 'Administrator' || data.role === 'Admin Kesbangpol') {
                window.location.href = '/adminpanel';
            } else {
                return;
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPdp = async () => {
        try {
            const response = await axios.get(`${UrlApi}/userpanel/pdp/${user?.id_pdp}`, {
                withCredentials: true
            });
            setAuthPdp(response.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getOrganisasi = async () => {
        try {
            const response = await axios.get(`${UrlApi}/userpanel/organisasi/${user?.id_pdp}`, {
                withCredentials: true
            });
            setOrganisasi(response.data);
        } catch (error: any) {
            console.error('Error fetching organisasi:', error);
        }
    };

    const getPendidikan = async () => {
        try {
            const response = await axios.get(`${UrlApi}/userpanel/pendidikan/${user?.id_pdp}`, {
                withCredentials: true
            });
            setPendidikan(response.data);
        } catch (error: any) {
            console.error('Error fetching pendidikan:', error);
        }
    };

    useEffect(() => {
        if (!user) fetchUser();
        if (user) fetchPdp();
        if (user) getOrganisasi();
        if (user) getPendidikan();
    }, [user, setUser, setAuthPdp]);

    // Handle scroll effect
    useEffect(() => {
        const { header, bgHamburger } = hamburgerRefs;

        if (typeof window === 'undefined' || !header.current || !bgHamburger.current) return;

        const handleScroll = () => {
            const fixedNav = header.current!.offsetTop;
            if (window.scrollY > fixedNav) {
                header.current!.classList.add('navbar-admin-fixed');
                bgHamburger.current!.classList.add('bg-opacity-0');
            } else {
                header.current!.classList.remove('navbar-admin-fixed');
                bgHamburger.current!.classList.remove('bg-opacity-0');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        const result = await Swal.fire({
            title: 'Yakin ingin logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${UrlApi}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                setUser(null);
                window.location.href = '/';
            } catch (error) {
                console.error('Error logout:', error);
                Swal.fire({ icon: 'error', text: 'Gagal logout' });
            }
        }
    }, [setUser]);

    // Toggle sidebar collapse
    const btnColaps = useCallback(() => {
        setColaps(prevIsColaps => {
            const newIsColaps = !prevIsColaps;

            // Toggle classes for sidebar elements
            const elementsToToggle = [
                { ref: appNameRef, className: 'app-name-colaps' },
                { ref: topbarRef, className: 'topbar-expanse' },
                { ref: mainContentRef, className: 'main-content-expanse' },
                { ref: sidebarRef, className: 'menu-name-colaps' },
                ...Object.values(menuRefs).map(ref => ({ ref, className: 'menu-name-colaps' }))
            ];

            elementsToToggle.forEach(({ ref, className }) => {
                ref.current?.classList.toggle(className, newIsColaps);
            });

            // Toggle classes for multiple elements
            if (typeof window !== 'undefined') {
                document.querySelectorAll('.menu-arrow').forEach(element => {
                    element.classList.toggle('hidden', newIsColaps);
                });
                document.querySelectorAll('.menu-separator').forEach(element => {
                    element.classList.toggle('menu-separator-hidden', newIsColaps);
                });
                document.querySelectorAll('.menu-list').forEach(element => {
                    element.classList.toggle('menu-list-colaps', newIsColaps);
                });
            }

            return newIsColaps;
        });
    }, [menuRefs]);

    // Hamburger menu handler
    const hamburgerHandle = useCallback(() => {
        const { hamburgerAdmin, slideoverContainer, slideoverBG, slideover } = hamburgerRefs;

        hamburgerAdmin.current?.classList.toggle('hamburgera-active');
        slideoverContainer.current?.classList.toggle('invisible');
        slideoverBG.current?.classList.toggle('opacity-50');
        slideover.current?.classList.toggle('translate-x-full');
    }, []);

    // Menu handlers - FIXED VERSION
    const handleBiodataMenu = () => {
        const menuBiodata = document.getElementById('biodata-menu');
        const listBiodata = document.getElementById('biodata-list');
        const menuPdp = document.getElementById('data-pdp-menu');
        const listPdp = document.getElementById('data-pdp-list');

        // Close PDP menu if open
        if (menuPdp?.classList.contains('grup3-active')) {
            menuPdp.classList.remove('grup3-active');
            listPdp?.classList.add('hidden');
        }

        // Toggle Biodata menu
        if (menuBiodata && listBiodata) {
            const isActive = menuBiodata.classList.contains('grup4-active');
            if (isActive) {
                menuBiodata.classList.remove('grup4-active');
                listBiodata.classList.add('hidden');
            } else {
                menuBiodata.classList.add('grup4-active');
                listBiodata.classList.remove('hidden');
            }
        }
    };

    const handlePdpMenu = () => {
        const menuPdp = document.getElementById('data-pdp-menu');
        const listPdp = document.getElementById('data-pdp-list');
        const menuBiodata = document.getElementById('biodata-menu');
        const listBiodata = document.getElementById('biodata-list');

        // Close Biodata menu if open
        if (menuBiodata?.classList.contains('grup4-active')) {
            menuBiodata.classList.remove('grup4-active');
            listBiodata?.classList.add('hidden');
        }

        // Toggle PDP menu
        if (menuPdp && listPdp) {
            const isActive = menuPdp.classList.contains('grup3-active');
            if (isActive) {
                menuPdp.classList.remove('grup3-active');
                listPdp.classList.add('hidden');
            } else {
                menuPdp.classList.add('grup3-active');
                listPdp.classList.remove('hidden');
            }
        }
    };

    if (!user) {
        return (
            <main className='mt-18'>
                <div className='relative'>
                    <div className='flex items-center justify-center min-h-screen'>
                        <div className='text-center'>
                            <LoadingIndikator />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className='mt-18'>
            <div className='relative'>
                <div className='relative'>
                    {/* Topbar */}
                    <div className='topbar header' id='topbar' ref={topbarRef}>
                        <div className='flex w-full justify-end'>
                            <header ref={hamburgerRefs.header}>
                                <div className='block' id='bg-hamburger' ref={hamburgerRefs.bgHamburger}>
                                    <div
                                        className='hamburgera'
                                        onClick={hamburgerHandle}
                                        id='hamburger-admin'
                                        ref={hamburgerRefs.hamburgerAdmin}
                                    >
                                        <span className='origin-top-left hamburger-admin-line'></span>
                                        <span className='hamburger-admin-line'></span>
                                        <span className='origin-bottom-left hamburger-admin-line'></span>
                                    </div>
                                </div>
                                <div className='flex justify-end items-center'>
                                    {colorTheme === 'light' ? (
                                        <button
                                            onClick={() => setTheme('light')}
                                            className='my-auto text-2xl fas fa-moon text-red-600 cursor-pointer focus:outline-none'
                                            aria-label='Switch to dark mode'
                                        />
                                    ) : (
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className='my-auto text-2xl fas fa-sun text-red-600 cursor-pointer focus:outline-none'
                                            aria-label='Switch to light mode'
                                        />
                                    )}

                                    <div className='relative ml-3'>
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    type='button'
                                                    className='cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-900 transition duration-150 ease-in-out border border-transparent rounded-md dark:text-gray-50 hover:text-gray-500 focus:outline-none'
                                                    aria-label='User menu'
                                                >
                                                    {user.avatar ? (
                                                        <img
                                                            src={`${BaseUrl + user.avatar}`}
                                                            alt={user.name}
                                                            className='h-10 w-10 mr-3 rounded-full object-cover'
                                                        />
                                                    ) : (
                                                        <img
                                                            src='/assets/images/logo-dppi.png'
                                                            alt="Default avatar"
                                                            className='h-10 w-10 mr-3 rounded-full object-cover'
                                                        />
                                                    )}
                                                </button>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <div className='flex bg-white dark:bg-gray-950 p-2'>
                                                    {user.avatar ? (
                                                        <img
                                                            className='w-10 h-10 mx-2 rounded-full object-cover'
                                                            src={`${BaseUrl + user.avatar}`}
                                                            alt='Avatar User'
                                                        />
                                                    ) : (
                                                        <img
                                                            src='/assets/images/logo-dppi.png'
                                                            alt="Default avatar"
                                                            className='w-10 h-10 mx-2 rounded-full object-cover'
                                                        />
                                                    )}
                                                    <div className='block'>
                                                        <p className='mx-2 mt-1 text-base font-bold text-black dark:text-gray-100'>{user.name}</p>
                                                        <p className='mx-2 text-sm text-gray-400'>{user.role.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <div className='border-b dark:border-white/20 border-gray-200'></div>

                                                <Dropdown.Link href='/auth/profile-user'>
                                                    <div className=''>
                                                        <i className='text-base fas fa-user dark:text-gray-100 text-gray-900 w-5'></i>
                                                        <span className='ml-3 text-base dark:text-gray-100 text-gray-900'>Profile</span>
                                                    </div>
                                                </Dropdown.Link>

                                                <Dropdown.Link href='/auth/password'>
                                                    <div className=''>
                                                        <i className='text-base fas fa-key dark:text-gray-100 text-gray-900 w-5'></i>
                                                        <span className='ml-3 text-base dark:text-gray-100 text-gray-900'>Password</span>
                                                    </div>
                                                </Dropdown.Link>

                                                <button
                                                    type='button'
                                                    className='flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-red-500 dark:text-red-400'
                                                    onClick={logout}
                                                >
                                                    <i className='text-base fas fa-sign-out-alt w-5'></i>
                                                    <span className='ml-3 text-base'>Logout</span>
                                                </button>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>
                            </header>
                        </div>
                    </div>

                    {/* Mobile Slideover Menu */}
                    <div
                        id='slideover-container'
                        ref={hamburgerRefs.slideoverContainer}
                        className='fixed inset-0 z-10 invisible h-full max-w-full overflow-auto bg-white/50 lg:hidden'
                    >
                        <div id='slideover-bg' className='navbar-sm'></div>
                        <div
                            id='slideover'
                            ref={hamburgerRefs.slideover}
                            className='absolute right-0 w-full h-full transition-all duration-300 ease-out translate-x-full bg-white border-t-4 shadow-inner backdrop-blur-sm bg-opacity-80 border-secondary'
                        >

                            <ul className='absolute leading-5 top-16 '>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel' className=''>
                                        <div className={pathname === '/userpanel' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>Userpanel</div>
                                    </a>
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/biodata' className=''>
                                        <div className={pathname === '/userpanel/biodata' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            Biodata
                                        </div>
                                    </a>
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/pendidikan' className=''>
                                        <div className={pathname === '/userpanel/pendidikan' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            Pendidikan
                                        </div>
                                    </a>
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/diklat' className=''>
                                        <div className={pathname === '/userpanel/diklat' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            Diklat / Kursus Singkat
                                        </div>
                                    </a>
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/penghargaan' className=''>
                                        <div className={pathname === '/userpanel/penghargaan' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            Penghargaan
                                        </div>
                                    </a>
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/organisasi' className=''>
                                        <div className={pathname === '/userpanel/organisasi' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            Organisasi
                                        </div>
                                    </a>
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/kegiatan' className=''>
                                        <div className={pathname === '/userpanel/kegiatan' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            Kegiatan
                                        </div>
                                    </a>
                                </li>
                                <li className='text-primary'>
                                    <DownloadCVButton pdp={authPdp} pendidikan={pendidikan} organisasi={organisasi} />
                                </li>
                                <li className='mx-1 mr-3'>
                                    <a href='/userpanel/id-card' className=''>
                                        <div className={pathname === '/userpanel/id-card' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                            ID-CARD
                                        </div>
                                    </a>
                                </li>

                                {user.role === 'Pelaksana' ? (
                                    <ul>

                                        <li className='mx-1 mr-3'>
                                            <a className='flex' href='/userpanel/profile-pelaksana'>
                                                <div className={pathname === '/userpanel/profile-pelaksana' ? 'bg-accent rounded-md px-2 text-white py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                                    Profile Pelaksana
                                                </div>
                                            </a>
                                        </li>
                                        <li className='mx-1 mr-3'>
                                            <div className='mt-3 rounded-md px-2 py-2 mx-1 w-full text-dark'>
                                                ---- Data PDP
                                            </div>
                                        </li>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/userpanel/data-pdp/belum-registrasi'>
                                                <p className={pathname.includes('/userpanel/data-pdp/belum-registrasi') ? 'bg-accent rounded-md px-2 text-white mx-1 w-full ' : 'text-primary px-1 mx-1'}>
                                                    PDP Belum Registrasi
                                                </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/userpanel/data-pdp/belum-diverifikasi'>

                                                <p className={pathname.includes('/userpanel/data-pdp/belum-diverifikasi') ? 'bg-accent rounded-md px-2 text-white mx-1 w-full ' : 'text-primary px-1 mx-1'}>
                                                    PDP Belum Diverifikasi
                                                </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/userpanel/data-pdp/verified'>

                                                <p className={pathname.includes('/userpanel/data-pdp/verified') ? 'bg-accent rounded-md px-2 text-white mx-1 w-full ' : 'text-primary px-1 mx-1'}>PDP Verified </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/userpanel/data-pdp/simental'>

                                                <p className={pathname.includes('/userpanel/data-pdp/simental') ? 'bg-accent rounded-md px-2 text-white mx-1 w-full ' : 'text-primary px-1 mx-1'}>PDP Simental </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/userpanel/data-pdp/tidak-aktif'>

                                                <p className={pathname.includes('/userpanel/data-pdp/tidak-aktif') ? 'bg-accent rounded-md px-2 text-white mx-1 w-full ' : 'text-primary px-1 mx-1'}>PDP Tidak Aktif</p>
                                            </a>
                                        </div>

                                    </ul>
                                ) : (
                                    <></>
                                )}

                            </ul>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='relative'>
                        <div className={`sidebar ${isColaps == true ? 'colaps' : ''}`} id='sidebar'>
                            <div className='flex'>
                                <a href='/adminpanel'>
                                    <img className='w-10 h-10 my-2 ml-4' src='/assets/images/simental.png' alt='Logo Simental Perkasa DPPI RI' />
                                </a>
                                <p className={`app-name ${isColaps == true ? 'colaps' : ''}`} id='app-name'>
                                    SIMENTAL PERKASA
                                </p>

                                <button className={`btn-colaps ${isColaps == true ? 'colaps' : ''}`} id='btn-colaps' onClick={btnColaps}>
                                    <i className='px-1 py-1 fas fa-chevron-left'></i>
                                </button>
                            </div>

                            <button className={pathname === '/userpanel' ? 'active bg-violet-500 flex py-2 mx-2 mt-4 ' : 'text-white flex py-2 mx-2 mt-4'}>
                                <a className='flex' href='/userpanel'>
                                    <i className='pl-2 mx-2 text-xl fas fa-home text-accent'></i>
                                    <p className='menu-list'>Dashboard</p>
                                </a>
                            </button>

                            {/* Biodata Menu */}
                            <div
                                className={
                                    pathname === '/userpanel/biodata' ||
                                        pathname === '/userpanel/pendidikan' ||
                                        pathname === '/userpanel/diklat' ||
                                        pathname === '/userpanel/penghargaan' ||
                                        pathname === '/userpanel/organisasi'
                                        ? 'grup4 grup4-active'
                                        : 'grup4'
                                }
                                onClick={handleBiodataMenu}
                                id='biodata-menu'>
                                <button
                                    className={
                                        pathname === '/userpanel/biodata' ||
                                            pathname === '/userpanel/pendidikan' ||
                                            pathname === '/userpanel/diklat' ||
                                            pathname === '/userpanel/penghargaan' ||
                                            pathname === '/userpanel/organisasi'
                                            ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group4:'
                                            : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                    }>
                                    <i className='mx-2 text-xl py-auto fas fa-user-cog text-accent'></i>
                                    <div className='grid grid-cols-12'>
                                        <span className='col-span-11 py-1 text-left menu-list' id='menu-name4'>
                                            Biodata
                                        </span>
                                        <span className='my-auto'>
                                            <svg
                                                className='w-4 h-4 my-auto transition duration-150 ease-in-out transform -rotate-90 fill-current menu-arrow text-accent'
                                                xmlns='http://www.w3.org/2000/svg'
                                                viewBox='0 0 20 20'>
                                                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                                            </svg>
                                        </span>
                                    </div>
                                </button>
                                <div
                                    className={
                                        pathname === '/userpanel/biodata' ||
                                            pathname === '/userpanel/pendidikan' ||
                                            pathname === '/userpanel/diklat' ||
                                            pathname === '/userpanel/penghargaan' ||
                                            pathname === '/userpanel/organisasi'
                                            ? ''
                                            : 'hidden'
                                    }
                                    id='biodata-list'>
                                    <div className='flex py-2 mx-2'>
                                        <Link className='flex' href='/userpanel/biodata'>
                                            <i
                                                className={
                                                    pathname === '/userpanel/biodata'
                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                }></i>
                                            <p className={pathname === '/userpanel/biodata' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Profil</p>
                                        </Link>
                                    </div>
                                    <div className='flex py-2 mx-2'>
                                        <Link className='flex' href='/userpanel/pendidikan'>
                                            <i
                                                className={
                                                    pathname === '/userpanel/pendidikan'
                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                }></i>
                                            <p className={pathname === '/userpanel/pendidikan' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Pendidikan</p>
                                        </Link>
                                    </div>
                                    <div className='flex py-2 mx-2'>
                                        <Link className='flex' href='/userpanel/diklat'>
                                            <i
                                                className={
                                                    pathname === '/userpanel/diklat'
                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                }></i>
                                            <p className={pathname === '/userpanel/diklat' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Diklat / Kursus Singkat</p>
                                        </Link>
                                    </div>
                                    <div className='flex py-2 mx-2'>
                                        <Link className='flex' href='/userpanel/penghargaan'>
                                            <i
                                                className={
                                                    pathname === '/userpanel/penghargaan'
                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                }></i>
                                            <p className={pathname === '/userpanel/penghargaan' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Penghargaan</p>
                                        </Link>
                                    </div>
                                    <div className='flex py-2 mx-2'>
                                        <Link className='flex' href='/userpanel/organisasi'>
                                            <i
                                                className={
                                                    pathname === '/userpanel/organisasi'
                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                }></i>
                                            <p className={pathname === '/userpanel/organisasi' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Organisasi</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <button className={pathname === '/userpanel/kegiatan' ? 'active bg-violet-500 flex py-2 mx-2' : 'text-white flex py-2 mx-2'}>
                                <Link className='flex' href='/userpanel/kegiatan'>
                                    <i className='pl-2 mx-2 text-xl fas fa-calendar-check text-accent'></i>
                                    <p className='menu-list ml-2'>Kegiatan</p>
                                </Link>
                            </button>

                            <div className='flex'>
                                <i className='fas fa-external-link-alt ml-6 py-2 text-xl text-accent'></i>
                                <div className='menu-list'>
                                    <DownloadCVButton pdp={authPdp} pendidikan={pendidikan} organisasi={organisasi} />
                                </div>
                            </div>

                            <button className={pathname === '/userpanel/id-card' ? 'active bg-violet-500 flex py-2 mx-2' : 'text-white flex py-2 mx-2'}>
                                <Link className='flex' href='/userpanel/id-card'>
                                    <i className='pl-2 ml-2 mr-3 text-xl fas fa-id-card text-accent'></i>
                                    <p className='menu-list'>E-Id Card</p>
                                </Link>
                            </button>

                            {user.role === 'Pelaksana' ? (
                                <>
                                    <ul>
                                        <li className={pathname === '/userpanel/profile-pelaksana' ? 'active bg-violet-500 flex py-2 mx-2' : 'text-white flex py-2 mx-2'}>
                                            <Link className='flex' href='/userpanel/profile-pelaksana'>
                                                <i className='pl-2 ml-2 mr-4 text-xl fas fa-user-tie text-accent'></i>
                                                <p className='menu-list'>Profile Pelaksana </p>
                                            </Link>
                                        </li>
                                    </ul>

                                    {/* Data PDP Menu - FIXED */}
                                    <div
                                        className={
                                            pathname.includes('/userpanel/data-pdp')
                                                ? 'grup3 grup3-active'
                                                : 'grup3'
                                        }
                                        onClick={handlePdpMenu}
                                        id='data-pdp-menu'>
                                        <button
                                            className={
                                                pathname.includes('/userpanel/data-pdp')
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                            }>
                                            <i className='mx-2 text-xl py-auto fas fa-users text-accent'></i>
                                            <div className='grid grid-cols-12'>
                                                <span className='col-span-11 py-1 mx-0 text-left menu-list' id='menu-name3'>
                                                    Data PDP
                                                </span>
                                                <span className='my-auto'>
                                                    <svg
                                                        className='w-4 h-4 my-auto transition duration-150 ease-in-out transform -rotate-90 fill-current menu-arrow text-accent'
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        viewBox='0 0 20 20'>
                                                        <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                                                    </svg>
                                                </span>
                                            </div>
                                        </button>
                                        <div
                                            className={
                                                pathname.includes('/userpanel/data-pdp')
                                                    ? ''
                                                    : 'hidden'
                                            }
                                            id='data-pdp-list'>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/userpanel/data-pdp/belum-registrasi'>
                                                    <i
                                                        className={
                                                            pathname.includes('/userpanel/data-pdp/belum-registrasi')
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }></i>
                                                    <p className={pathname.includes('/userpanel/data-pdp/belum-registrasi') ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                        PDP Belum Registrasi
                                                    </p>
                                                </a>
                                            </div>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/userpanel/data-pdp/belum-diverifikasi'>
                                                    <i
                                                        className={
                                                            pathname.includes('/userpanel/data-pdp/belum-diverifikasi')
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }></i>
                                                    <p className={pathname.includes('/userpanel/data-pdp/belum-diverifikasi') ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                        PDP Belum Diverifikasi
                                                    </p>
                                                </a>
                                            </div>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/userpanel/data-pdp/verified'>
                                                    <i
                                                        className={
                                                            pathname.includes('/userpanel/data-pdp/verified')
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }></i>
                                                    <p className={pathname.includes('/userpanel/data-pdp/verified') ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>PDP Verified </p>
                                                </a>
                                            </div>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/userpanel/data-pdp/simental'>
                                                    <i
                                                        className={
                                                            pathname.includes('/userpanel/data-pdp/simental')
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }></i>
                                                    <p className={pathname.includes('/userpanel/data-pdp/simental') ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>PDP Simental </p>
                                                </a>
                                            </div>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/userpanel/data-pdp/tidak-aktif'>
                                                    <i
                                                        className={
                                                            pathname.includes('/userpanel/data-pdp/tidak-aktif')
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }></i>
                                                    <p className={pathname.includes('/userpanel/data-pdp/tidak-aktif') ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>PDP Tidak Aktif</p>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <main
                        className='main-content-dashboard'
                        id='main-content'
                        ref={mainContentRef}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </main>
    );
}