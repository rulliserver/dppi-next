'use client';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { UrlApi } from '../components/apiUrl';
import { BaseUrl } from '../components/baseUrl';
import darkMode from '../components/DarkMode';
import Dropdown from '../components/Dropdown';
import { useUser } from '../components/UserContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, setUser } = useUser();
    const [isButtonClicked, setIsButtonClicked] = useState(false);
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
    useEffect(() => {

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

                if (data.role === 'Superadmin' || data.role === 'Administrator' || data.role === 'Admin Kesbangpol' || data.role === 'Admin Pendaftaran' || data.role === 'Jurnalis') {
                    return;
                } else {
                    window.location.href = '/userpanel';
                }
            } catch (err) {
                console.error(err);
            }
        };

        if (!user) fetchUser();
    }, [user, setUser]);

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

    // Menu handlers
    const createMenuHandler = (menuId: string, listId: string, activeClass: string) => {
        return () => {
            const menu = document.getElementById(menuId);
            const list = document.getElementById(listId);

            if (menu && list) {
                if (menu.classList.contains(activeClass)) {
                    menu.classList.remove(activeClass);
                    list.classList.add('hidden');
                    setIsButtonClicked(true);
                } else {
                    menu.classList.add(activeClass);
                    list.classList.remove('hidden');
                }
            }
        };
    };

    const handlePelaksanaMenu = createMenuHandler('pelaksana-menu', 'pelaksana-list', 'grup2-active');
    const handlePendaftaranMenu = createMenuHandler('pendaftaran-menu', 'pendaftaran-list', 'grup4-active');
    const handlePdpMenu = createMenuHandler('pdp-menu', 'pdp-list', 'grup3-active');
    const regexPdp = /(pdp)/i;
    const regexPdpBelumRegistrasi = /(belum-registrasi)/i;
    const regexPdpBelumDiverifikasi = /(belum-diverifikasi)/i;
    const regexPdpVerified = /(verified)/i;
    const regexPdpSimental = /(simental)/i;
    const regexPdpTidakAktif = /(tidak-aktif)/i;
    const regexBerita = /(berita)/i;

    if (!user) {
        return (
            <main className='mt-18'>
                <div className='relative'>
                    <div className='flex items-center justify-center min-h-screen'>
                        <div className='text-center'>
                            <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto'></div>
                            <p className='mt-4 text-gray-600'>Memuat...</p>
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

                                                <Dropdown.Link href='/auth/profile'>
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
                            <nav className='absolute top-16 w-full'>
                                <ul className='leading-5'>
                                    <li>
                                        <a
                                            href='/adminpanel'
                                            className={`block px-4 py-2 ${pathname === '/adminpanel'
                                                ? 'bg-violet-500 text-white rounded-md'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {user.role === "Administrator" || user.role === "Superadmin" ? "Adminpanel" : "Dashboard"}
                                        </a>
                                    </li>
                                    {user.role === "Administrator" || user.role === "Superadmin" ? (
                                        <div className="">
                                            <li>
                                                <a
                                                    href='/adminpanel/rating'
                                                    className={`block px-4 py-2 ${pathname === '/adminpanel/rating'
                                                        ? 'bg-violet-500 text-white rounded-md'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Rating
                                                </a>
                                            </li>

                                            <li>
                                                <a
                                                    href='/adminpanel/video'
                                                    className={`block px-4 py-2 ${pathname === '/adminpanel/video'
                                                        ? 'bg-violet-500 text-white rounded-md'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Video
                                                </a>
                                            </li>
                                        </div>
                                    ) : ''}

                                    <li className='px-3 mt-4 text-gray-500 text-sm'>--- Data PDP</li>
                                    {[

                                        { href: '/adminpanel/pdp/belum-registrasi', label: 'PDP Belum Registrasi' },
                                        { href: '/adminpanel/pdp/belum-diverifikasi', label: 'PDP Belum Diverifikasi' },
                                        { href: '/adminpanel/pdp/verified', label: 'PDP Verified' },
                                        { href: '/adminpanel/pdp/simental', label: 'PDP Simental' },
                                        { href: '/adminpanel/pdp/tidak-aktif', label: 'PDP Tidak Aktif' },

                                    ].map((item) => (
                                        <li key={item.href}>
                                            <a
                                                href={item.href}
                                                className={`block px-4 py-2 ${pathname === item.href
                                                    ? 'bg-violet-500 text-white rounded-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    ))}

                                    {user.role === "Administrator" || user.role === "Superadmin" || user.role === "Admin Pendaftaran" ? (
                                        <div className="">
                                            <li className='px-3 mt-4 text-gray-500 text-sm'>--- Pendaftaran DPPI</li>
                                            <li>
                                                <a
                                                    href='/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota'
                                                    className={`block px-4 py-2 ${pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota'
                                                        ? 'bg-violet-500 text-white rounded-md'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Data Pendaftaran DPPI Tingkat Kab/Kota
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    href='/adminpanel/list-pendaftaran-pengangkatan-dppi-provinsi'
                                                    className={`block px-4 py-2 ${pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-provinsi'
                                                        ? 'bg-violet-500 text-white rounded-md'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Data Pendaftaran DPPI Tingkat Provinsi
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    href='/adminpanel/upload-surat-rekomendasi'
                                                    className={`block px-4 py-2 ${pathname === '/adminpanel/upload-surat-rekomendasi'
                                                        ? 'bg-violet-500 text-white rounded-md'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    Surat Rekomendasi
                                                </a>
                                            </li>

                                        </div>
                                    ) : ""}
                                </ul>
                            </nav>
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
                            <button className={pathname === '/adminpanel' ? 'active bg-violet-500 flex py-2 mx-2 mt-4 ' : 'text-white flex py-2 mx-2 mt-4'} disabled={isButtonClicked}>
                                <a className='flex' href='/adminpanel'>
                                    <i className='pl-2 mx-2 text-xl fas fa-home text-accent'></i>
                                    <p className='menu-list'>Dashboard</p>
                                </a>
                            </button>
                            <div className='flex mx-4'>
                                <span className='w-10 dash-separator'></span>
                                <p className='ml-2 menu-separator'>Input Data</p>
                            </div>
                            {user.role === "Administrator" || user.role === "Superadmin" ? (
                                <div>
                                    <a
                                        href='/adminpanel/rating'
                                        className={
                                            pathname === '/adminpanel/rating'
                                                ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                        }>
                                        <i className={pathname === '/adminpanel/rating' ? 'mx-2 text-xl py-auto fas fa-star text-purple-600' : 'mx-2 text-xl py-auto fas fa-star text-accent'}></i>

                                        <p className='mx-1 menu-list' id='menu-name0'>
                                            Rating
                                        </p>
                                    </a>
                                    <a
                                        href='/adminpanel/video'
                                        className={
                                            pathname === '/adminpanel/video'
                                                ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                        }>
                                        <i className={pathname === '/adminpanel/video' ? 'mx-2 text-xl py-auto fas fa-video text-purple-600' : 'mx-2 text-xl py-auto fas fa-video text-accent'}></i>

                                        <p className='mx-1 menu-list' id='menu-name0'>
                                            Video
                                        </p>
                                    </a>
                                </div>
                            ) : ''}
                            {/* pdp */}
                            {user.role === "Administrator" || user.role === "Superadmin" || user.role === "Admin Kesbangpol" ? (
                                <div className={regexPdp.test(window.location.href) ? 'grup3 grup3-active' : 'grup3'} onClick={handlePdpMenu} id='pdp-menu'>
                                    <button
                                        className={
                                            regexPdp.test(window.location.href)
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
                                    <div className={regexPdp.test(window.location.href) ? '' : 'hidden'} id='pdp-list'>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/adminpanel/pdp/belum-registrasi'>
                                                <i
                                                    className={
                                                        regexPdpBelumRegistrasi.test(window.location.href)
                                                            ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                            : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                    }></i>
                                                <p className={regexPdpBelumRegistrasi.test(window.location.href) ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                    PDP Belum Registrasi
                                                </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/adminpanel/pdp/belum-diverifikasi'>
                                                <i
                                                    className={
                                                        regexPdpBelumDiverifikasi.test(window.location.href)
                                                            ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                            : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                    }></i>
                                                <p className={regexPdpBelumDiverifikasi.test(window.location.href) ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                    PDP Belum Diverifikasi
                                                </p>
                                            </a>
                                        </div>

                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/adminpanel/pdp/verified'>
                                                <i
                                                    className={
                                                        regexPdpVerified.test(window.location.href)
                                                            ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                            : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                    }></i>
                                                <p className={regexPdpVerified.test(window.location.href) ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>PDP Verified </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/adminpanel/pdp/simental'>
                                                <i
                                                    className={
                                                        regexPdpSimental.test(window.location.href)
                                                            ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                            : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                    }></i>
                                                <p className={regexPdpSimental.test(window.location.href) ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>PDP Simental </p>
                                            </a>
                                        </div>
                                        <div className='flex py-2 mx-2'>
                                            <a className='flex' href='/adminpanel/pdp/tidak-aktif'>
                                                <i
                                                    className={
                                                        regexPdpTidakAktif.test(window.location.href)
                                                            ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                            : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                    }></i>
                                                <p className={regexPdpTidakAktif.test(window.location.href) ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>PDP Tidak Aktif</p>
                                            </a>
                                        </div>
                                    </div>
                                </div>)
                                : ''}

                            <div>
                                {user.role === "Administrator" || user.role === "Superadmin" || user.role === "Admin Pendaftaran" ? (
                                    <div
                                        className={
                                            pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota' || pathname === 'list-pendaftaran-pengangkatan-dppi-provinsi' || pathname === 'upload-surat-rekomendasi'
                                                ? 'grup4 grup4-active'
                                                : 'grup4'
                                        }
                                        onClick={handlePendaftaranMenu}
                                        id='pendaftaran-menu'>
                                        <button
                                            className={
                                                pathname === 'list-pendaftaran-pengangkatan-dppi-provinsi' || pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota' || pathname === '/adminpanel/upload-surat-rekomendasi'
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                            }>
                                            <i className='mx-2 text-xl py-auto fas fa-file-alt text-accent'></i>
                                            <div className='grid grid-cols-12'>
                                                <span className='col-span-11 py-1 mx-1 text-left menu-list' id='menu-name4'>
                                                    Pengangkatan DPPI
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
                                                pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-provinsi' || pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota' || pathname === '/adminpanel/upload-surat-rekomendasi' ? '' : 'hidden'
                                            }
                                            id='pendaftaran-list'>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota'>
                                                    <i
                                                        className={
                                                            pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota'
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }></i>
                                                    <p className={pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-kab-kota' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Tingkat Kab/Kota</p>
                                                </a>
                                            </div>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/adminpanel/list-pendaftaran-pengangkatan-dppi-provinsi'>
                                                    <i
                                                        className={
                                                            pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-provinsi'
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }
                                                    />
                                                    <p className={pathname === '/adminpanel/list-pendaftaran-pengangkatan-dppi-provinsi' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                        Tingkat Provinsi
                                                    </p>
                                                </a>
                                            </div>
                                            <div className='flex py-2 mx-2'>
                                                <a className='flex' href='/adminpanel/upload-surat-rekomendasi'>
                                                    <i
                                                        className={
                                                            pathname === '/adminpanel/upload-surat-rekomendasi'
                                                                ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                        }
                                                    />
                                                    <p className={pathname === '/adminpanel/upload-surat-rekomendasi' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                        Surat Rekomendasi
                                                    </p>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) :
                                    ''}
                                {user.role === "Administrator" || user.role === "Superadmin" || user.role === "Jurnalis" ? (
                                    <div>
                                        <div>
                                            <a href='/adminpanel/berita'
                                                className={
                                                    regexBerita.test(window.location.href)
                                                        ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                        : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                                }>
                                                <i
                                                    className={
                                                        regexBerita.test(window.location.href)
                                                            ? 'mx-2 text-xl py-auto fas fa-newspaper text-purple-600'
                                                            : 'mx-2 text-xl py-auto fas fa-newspaper text-accent'
                                                    }></i>

                                                <p className='mx-0 menu-list' id='menu-name1'>
                                                    Data Berita
                                                </p>
                                            </a>
                                        </div>
                                        <div>
                                            <a href='/adminpanel/pengumuman'
                                                className={
                                                    pathname === '/adminpanel/pengumuman'
                                                        ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                        : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                                }>
                                                <i
                                                    className={
                                                        pathname === '/adminpanel/pengumuman'
                                                            ? 'mx-4 text-xl py-auto fas fa-info text-purple-600'
                                                            : 'mx-4 text-xl py-auto fas fa-info text-accent'
                                                    }></i>

                                                <p className='mx-0 menu-list' id='menu-name1'>
                                                    Pengumuman
                                                </p>
                                            </a>
                                        </div>
                                    </div>
                                ) : ''}

                                {/* pelaksana */}
                                {user.role === "Administrator" || user.role === "Superadmin" || user.role === "Admin Kesbangpol" ? (
                                    <div
                                        className={
                                            pathname === '/adminpanel/pelaksana-pusat' || pathname === '/adminpanel/pelaksana-provinsi' || pathname === '/adminpanel/pelaksana-kabupaten'
                                                ? 'grup2 grup2-active'
                                                : 'grup2'
                                        }
                                        onClick={handlePelaksanaMenu}
                                        id='pelaksana-menu'>
                                        <button
                                            className={
                                                pathname === '/adminpanel/pelaksana-provinsi' || pathname === '/adminpanel/pelaksana-pusat' || pathname === '/adminpanel/pelaksana-kabupaten'
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                            }>
                                            <i className='mx-2 text-xl py-auto fas fa-user-tie text-accent'></i>
                                            <div className='grid grid-cols-12'>
                                                <span className='col-span-11 py-1 mx-1 text-left menu-list' id='menu-name2'>
                                                    Pelaksana
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
                                                pathname === '/adminpanel/pelaksana-provinsi' || pathname === '/adminpanel/pelaksana-pusat' || pathname === '/adminpanel/majelis-pertimbangan' || pathname === '/adminpanel/pelaksana-kabupaten' ? '' : 'hidden'
                                            }
                                            id='pelaksana-list'>
                                            {user.role === "Administrator" || user.role === "Superadmin" ? (
                                                <>
                                                    <div className='flex py-2 mx-2'>
                                                        <a className='flex' href='/adminpanel/majelis-pertimbangan'>
                                                            <i
                                                                className={
                                                                    pathname === '/adminpanel/majelis-pertimbangan'
                                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                                }></i>
                                                            <p className={pathname === '/adminpanel/majelis-pertimbangan' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Majelis Pertimbangan</p>
                                                        </a>
                                                    </div>
                                                    <div className='flex py-2 mx-2'>
                                                        <a className='flex' href='/adminpanel/pelaksana-pusat'>
                                                            <i
                                                                className={
                                                                    pathname === '/adminpanel/pelaksana-pusat'
                                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                                }></i>
                                                            <p className={pathname === '/adminpanel/pelaksana-pusat' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>Pelaksana Pusat</p>
                                                        </a>
                                                    </div>
                                                </>
                                            ) : ''}
                                            {user.role === "Administrator" || user.role === "Superadmin" || (user.role === "Admin Kesbangpol" && user.id_kabupaten == 0)
                                                ? (
                                                    // Tampilkan Pelaksana Provinsi
                                                    <div className='flex py-2 mx-2'>
                                                        <a className='flex' href='/adminpanel/pelaksana-provinsi'>
                                                            <i
                                                                className={
                                                                    pathname === '/adminpanel/pelaksana-provinsi'
                                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                                }
                                                            />
                                                            <p className={pathname === '/adminpanel/pelaksana-provinsi' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                                Pelaksana Provinsi
                                                            </p>
                                                        </a>
                                                    </div>
                                                ) : ""}
                                            {user.role === "Administrator" || user.role === "Superadmin" || (user.role === "Admin Kesbangpol" && user.id_kabupaten !== 0)
                                                ? (
                                                    // Tampilkan Pelaksana Kabupaten
                                                    <div className='flex py-2 mx-2'>
                                                        <a className='flex' href='/adminpanel/pelaksana-kabupaten'>
                                                            <i
                                                                className={
                                                                    pathname === '/adminpanel/pelaksana-kabupaten'
                                                                        ? 'pl-8 mx-2 my-auto text-sm fas fa-circle text-purple-600 blur-[1.5px]'
                                                                        : 'pl-8 mx-2 my-auto text-sm fas fa-circle text-accent'
                                                                }
                                                            />
                                                            <p className={pathname === '/adminpanel/pelaksana-kabupaten' ? 'mx-1 menu-list font-semibold' : 'mx-1 menu-list'}>
                                                                Pelaksana Kabupaten
                                                            </p>
                                                        </a>
                                                    </div>
                                                )
                                                : null // Jika tidak memenuhi kondisi manapun, tampilkan 'null' (tidak ada apa-apa)
                                            }
                                        </div>
                                    </div>
                                ) : ''}
                                {user.role === "Administrator" || user.role === "Superadmin" ? (
                                    <>
                                        <a
                                            href='/adminpanel/galeri-foto'
                                            className={
                                                pathname === '/adminpanel/galeri-foto'
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/adminpanel/galeri-foto'
                                                        ? 'ml-2 mr-1 text-xl py-auto fas fa-image text-purple-600'
                                                        : 'ml-2 mr-1 text-xl py-auto fas fa-image text-accent'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name3'>
                                                Galeri Kegiatan
                                            </p>
                                        </a>
                                        <a
                                            href='/adminpanel/kegiatan'
                                            className={
                                                pathname === '/adminpanel/kegiatan'
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/adminpanel/kegiatan'
                                                        ? 'mx-2 text-xl py-auto fas fa-calendar-check text-purple-600'
                                                        : 'mx-2 text-xl py-auto fas fa-calendar-check text-accent'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name4'>
                                                Kegiatan
                                            </p>
                                        </a>
                                        <a
                                            href='/adminpanel/regulasi'
                                            className={
                                                pathname === '/adminpanel/regulasi'
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/adminpanel/regulasi' ? 'mx-2 text-xl py-auto fas fa-file-alt text-purple-600' : 'mx-2 text-xl py-auto fas fa-file-alt text-accent'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name5'>
                                                Regulasi
                                            </p>
                                        </a>
                                    </>) : ''}
                                {user.role === "Superadmin" ? (
                                    <a
                                        href='/adminpanel/user'
                                        className={
                                            pathname === '/adminpanel/user'
                                                ? 'active flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 group1:'
                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-accent/20 text-accent dark:text-white'
                                        }>
                                        <i
                                            className={
                                                pathname === '/adminpanel/user' ? 'mx-2 text-xl py-auto fas fa-users-cog text-purple-600' : 'mx-2 text-xl py-auto fas fa-users-cog text-accent'
                                            }></i>

                                        <p className='mx-1 menu-list' id='menu-name6'>
                                            Users
                                        </p>
                                    </a>) : ''}
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
                </div >
            </div >
        </main >
    );
}