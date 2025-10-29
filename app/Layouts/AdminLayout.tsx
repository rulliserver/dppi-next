'use client';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { UrlApi } from '../Components/apiUrl';
import { BaseUrl } from '../Components/baseUrl';
import darkMode from '../Components/DarkMode';
import Dropdown from '../Components/Dropdown';
import { useUser } from '../Components/UserContext';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, setUser }: any = useUser();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${UrlApi}/user`, {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                const userData = await response.json();

                setUser(userData);


            } catch (err: any) {
                console.error('Error:', err);
            }
        };

        if (!user) {
            fetchUser();
        }
    }, [user,]);

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Yakin ingin logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#d33',
            // cancelButtonText: 'Batal',
            confirmButtonText: 'Ya'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${UrlApi}/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                setUser(null); // Hapus data user dari context
                window.location.href = '/';
            } catch (error) {
                console.error('Error logout:', error);
                Swal.fire({ icon: 'error', text: 'Gagal logout' });
            }
        }
    };

    const [colorTheme, setTheme] = darkMode();

    const [isColaps, setColaps] = useState(false);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const appNameRef = useRef<HTMLParagraphElement>(null);
    const topbarRef = useRef<HTMLDivElement>(null);
    const mainContentRef = useRef<HTMLElement>(null);
    const menuNameRef = useRef<HTMLParagraphElement>(null);
    const menuName1Ref = useRef<HTMLParagraphElement>(null);
    const menuName2Ref = useRef<HTMLParagraphElement>(null);
    const menuName3Ref = useRef<HTMLParagraphElement>(null);
    const menuName4Ref = useRef<HTMLParagraphElement>(null);
    const menuName5Ref = useRef<HTMLParagraphElement>(null);

    const hamburgerAdminRef = useRef<HTMLDivElement>(null);
    const videooverContainerRef = useRef<HTMLDivElement>(null);
    const videooverBGRef = useRef<HTMLDivElement>(null);
    const videooverRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const bgHamburgerRef = useRef<HTMLDivElement>(null);

    // Efek untuk menangani scroll
    useEffect(() => {
        if (typeof window !== 'undefined' && headerRef.current && bgHamburgerRef.current) {
            const handleScroll = () => {
                const header = headerRef.current;
                const bgHamburger = bgHamburgerRef.current;
                if (header && bgHamburger) {
                    const fixedNav = header.offsetTop;
                    if (window.scrollY > fixedNav) {
                        header.classList.add('navbar-admin-fixed');
                        bgHamburger.classList.add('bg-opacity-0');
                    } else {
                        header.classList.remove('navbar-admin-fixed');
                        bgHamburger.classList.remove('bg-opacity-0');
                    }
                }
            };

            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    function btnColaps() {
        setColaps((prevIsColaps) => {
            const newIsColaps = !prevIsColaps;

            if (appNameRef.current) appNameRef.current.classList.toggle('app-name-colaps', newIsColaps);
            if (topbarRef.current) topbarRef.current.classList.toggle('topbar-expanse', newIsColaps);
            if (mainContentRef.current) mainContentRef.current.classList.toggle('main-content-expanse', newIsColaps);

            if (typeof window !== 'undefined') {
                document.querySelectorAll('.menu-arrow').forEach(function (element) {
                    element.classList.toggle('hidden', newIsColaps);
                });
                document.querySelectorAll('.menu-separator').forEach(function (element) {
                    element.classList.toggle('menu-separator-hidden', newIsColaps);
                });
                document.querySelectorAll('.menu-list').forEach(function (element) {
                    element.classList.toggle('menu-list-colaps', newIsColaps);
                });
            }

            if (sidebarRef.current) sidebarRef.current.classList.toggle('menu-name-colaps', newIsColaps);
            if (menuNameRef.current) menuNameRef.current.classList.toggle('menu-name-colaps', newIsColaps);
            if (menuName1Ref.current) menuName1Ref.current.classList.toggle('menu-name-colaps', newIsColaps);
            if (menuName2Ref.current) menuName2Ref.current.classList.toggle('menu-name-colaps', newIsColaps);
            if (menuName3Ref.current) menuName3Ref.current.classList.toggle('menu-name-colaps', newIsColaps);
            if (menuName4Ref.current) menuName4Ref.current.classList.toggle('menu-name-colaps', newIsColaps);
            if (menuName5Ref.current) menuName5Ref.current.classList.toggle('menu-name-colaps', newIsColaps);

            return newIsColaps;
        });
    }

    const hamburgerHandle = () => {
        if (hamburgerAdminRef.current && videooverContainerRef.current && videooverBGRef.current && videooverRef.current) {
            hamburgerAdminRef.current.classList.toggle('hamburgera-active');
            videooverContainerRef.current.classList.toggle('invisible');
            videooverBGRef.current.classList.toggle('opacity-50');
            videooverRef.current.classList.toggle('translate-x-full');
        }
    };

    const regex = /(geowisata)/i;
    const regex1 = /(geotourism-events)/i;
    return (
        <main className='mt-18'>
            <div className='relative'>
                {user ? (
                    <div className='relative'>
                        <div className='topbar header' id='topbar' ref={topbarRef}>
                            <div className='flex w-full justify-end'>
                                <header ref={headerRef}>
                                    <div className='block' id='bg-hamburger' ref={bgHamburgerRef}>
                                        <div className='hamburgera' onClick={hamburgerHandle} id='hamburger-admin' ref={hamburgerAdminRef}>
                                            <span className='origin-top-left hamburger-admin-line'></span>
                                            <span className='hamburger-admin-line'></span>
                                            <span className='origin-bottom-left hamburger-admin-line'></span>
                                        </div>
                                    </div>
                                    <div className='flex justify-end'>

                                        {colorTheme === 'light' ? (
                                            <span onClick={() => setTheme('light')} className='my-auto text-2xl fas fa-moon text-red-600 cursor-pointer'></span>
                                        ) : (
                                            <span onClick={() => setTheme('dark')} className='my-auto text-2xl fas fa-sun text-red-600 cursor-pointer'></span>
                                        )}

                                        <div className='relative ml-3 '>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <span className='inline-flex rounded-md cursor-pointer'>
                                                        <button
                                                            type='button'
                                                            className='cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-900 transition duration-150 ease-in-out border border-transparent rounded-md dark:text-gray-50 hover:text-gray-500 focus:outline-none'>
                                                            {user.avatar ? (
                                                                <img src={`${BaseUrl}/uploads/${user.avatar}`} alt={user.name} className='h-10 mr-3 rounded-full' />
                                                            ) : (
                                                                <img src='/assets/images/logo-dppi.png' className='h-10 mr-3 rounded-full' />
                                                            )}
                                                        </button>
                                                    </span>
                                                </Dropdown.Trigger>

                                                <Dropdown.Content>
                                                    <div className='flex bg-white dark:bg-gray-950'>
                                                        {user.avatar ? (
                                                            <img className='w-10 h-10 mx-2 my-2 rounded-full' src={`${BaseUrl}/uploads/${user.avatar}`} alt='Avatar User' />
                                                        ) : (
                                                            <img src='/assets/images/logo-dppi.png' className='w-10 h-10 mx-2 my-2 rounded-full' />
                                                        )}
                                                        <div className='block'>
                                                            <p className='mx-2 my-auto mt-1 text-base font-bold text-black dark:text-gray-100'>{user.name}</p>
                                                            <p className='mx-2 my-auto text-sm text-gray-400'>{user.role.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <div className='border-b dark:border-white0 border border-gray-200'></div>
                                                    <div className='flex bg-white dark:bg-dark hover:bg-mute'>
                                                        <Dropdown.Link href='/auth/profile'>
                                                            <div className='flex'>
                                                                <i className='text-base  pt-1 fas fa-user dark:text-gray-100 text-gray-900'></i>
                                                                <div className='block mx-4 text-base dark:text-gray-100 text-gray-900'>
                                                                    <p>Profile</p>
                                                                </div>
                                                            </div>
                                                        </Dropdown.Link>
                                                    </div>
                                                    <div className='flex bg-white dark:bg-dark hover:bg-mute'>
                                                        <Dropdown.Link href='/auth/password'>
                                                            <div className='flex'>
                                                                <i className='text-base  pt-1 fas fa-key dark:text-gray-100 text-gray-900'></i>
                                                                <div className='block mx-4 text-base dark:text-gray-100 text-gray-900'>
                                                                    <p>Password</p>
                                                                </div>
                                                            </div>
                                                        </Dropdown.Link>
                                                    </div>
                                                    <button type='button' className='flex bg-white px-4 py-2 dark:bg-dark hover:bg-gray-900 w-full cursor-pointer' onClick={logout}>
                                                        <div className='flex cursor-pointer'>
                                                            <i className='text-base fas pt-1 fa-sign-out-alt dark:text-gray-100 text-red-500 cursor-pointer'></i>
                                                            <div className='block mx-4 pt-0 text-base dark:text-gray-100 text-red-500 cursor-pointer'>
                                                                <p>Logout</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </header>
                            </div>
                        </div>

                        <div id='videoover-container' className='fixed inset-0 z-10 invisible h-full max-w-full overflow-auto dark:bg-black/50 bg-white/50 lg:hidden ' ref={videooverContainerRef}>
                            <div id='videoover-bg' className='navbar-admin-sm' ref={videooverBGRef}></div>
                            <div
                                id='videoover'
                                className='absolute right-0 w-full h-full transition-all duration-300 ease-out translate-x-full  border-t-4 dark:text-white shadow-inner backdrop-blur-sm bg-opacity-80 border-secondary'
                                ref={videooverRef}>
                                <ul className='absolute leading-5 top-16 '>
                                    {user.role === 'Superadmin' || user.role === 'Administrator' || user.role === 'Admin Kesbangpol' ? (
                                        <>
                                            <li className='mx-1 mr-3'>
                                                <Link href='/adminpanel' className=''>
                                                    <div className={pathname === '/adminpanel' ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                                        Adminpanel
                                                    </div>
                                                </Link>
                                            </li>

                                            {user.role === 'Superadmin' || user.role === 'Administrator' ? (
                                                <>
                                                    <div className='px-3 mt-4 text-gray-300'>--- Data</div>
                                                    <li className='mx-1 mr-3'>
                                                        <Link href='/adminpanel/video' className=''>
                                                            <div
                                                                className={
                                                                    pathname === '/adminpanel/video' ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'
                                                                }>
                                                                Video
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className='mx-1 mr-3'>
                                                        <Link href='/adminpanel/user' className=''>
                                                            <div
                                                                className={
                                                                    pathname === '/adminpanel/user' ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'
                                                                }>
                                                                Pengguna
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className='mx-1 mr-3'>
                                                        <Link href='/adminpanel/geowisata' className=''>
                                                            <div
                                                                className={
                                                                    pathname === '/adminpanel/geowisata'
                                                                        ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full '
                                                                        : 'text-primary px-1 py-2 mx-1'
                                                                }>
                                                                Geowisata
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className='mx-1 mr-3'>
                                                        <Link href='/adminpanel/geotourism-events' className=''>
                                                            <div
                                                                className={
                                                                    pathname === '/adminpanel/geotourism-events'
                                                                        ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full '
                                                                        : 'text-primary px-1 py-2 mx-1'
                                                                }>
                                                                Event Wisata
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </>
                                            ) : (
                                                ''
                                            )}
                                            {user.role === 'Superadmin' || user.role === 'Admin Kesbangpol' ? (
                                                <>
                                                    <div className='px-3 mt-4 text-gray-300'>--- Pengaturan</div>
                                                    <li className='mx-1 mr-3'>
                                                        <Link href='/adminpanel/data-wisatawan' className=''>
                                                            <div
                                                                className={
                                                                    pathname === '/adminpanel/data-wisatawan'
                                                                        ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full '
                                                                        : 'text-primary px-1 py-2 mx-1'
                                                                }>
                                                                Data Wisatawan
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li className='mx-1 mr-3'>
                                                        <Link href='/adminpanel/data-penelitian' className=''>
                                                            <div
                                                                className={
                                                                    pathname === '/adminpanel/data-penelitian'
                                                                        ? 'bg-red-500 rounded-md px-2 text-primary py-2 mx-1 w-full '
                                                                        : 'text-primary px-1 py-2 mx-1'
                                                                }>
                                                                Data Penelitian
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </>
                                            ) : (
                                                ''
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <li className='mx-1 mr-3'>
                                                <Link href='/userpanel' className=''>
                                                    <div className={pathname === '/userpanel' ? 'bg-red-300 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                                        Dashboard
                                                    </div>
                                                </Link>
                                            </li>
                                            <div className='px-3 mt-4 text-gray-300'>--- Pengaturan</div>
                                            <li className='mx-1 mr-3'>
                                                <Link href='/userpanel/pengunjung' className=''>
                                                    <div
                                                        className={
                                                            pathname === '/userpanel/pengunjung' ? 'bg-red-300 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'
                                                        }>
                                                        Input Wisatawan
                                                    </div>
                                                </Link>
                                            </li>
                                            <li className='mx-1 mr-3'>
                                                <Link href='/userpanel/harga-tiket' className=''>
                                                    <div
                                                        className={
                                                            pathname === '/userpanel/harga-tiket' ? 'bg-red-300 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'
                                                        }>
                                                        Update Tiket
                                                    </div>
                                                </Link>
                                            </li>
                                            <li className='mx-1 mr-3'>
                                                <Link href='/userpanel/paket-wisata' className=''>
                                                    <div
                                                        className={
                                                            pathname === '/userpanel/paket-wisata' ? 'bg-red-300 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'
                                                        }>
                                                        Paket Wisata
                                                    </div>
                                                </Link>
                                            </li>
                                            <li className='mx-1 mr-3'>
                                                <Link href='/userpanel/order' className=''>
                                                    <div className={pathname === '/userpanel/order' ? 'bg-red-300 rounded-md px-2 text-primary py-2 mx-1 w-full ' : 'text-primary px-1 py-2 mx-1'}>
                                                        Kelola Pesanan
                                                    </div>
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className='relative'>
                            <div className={`sidebar ${isColaps ? 'colaps' : ''}`} id='sidebar' ref={sidebarRef}>
                                <div className='flex'>
                                    <Link href='/adminpanel'>
                                        <img className='w-12 h-auto my-2 ml-4' src='/assets/images/logo-dppi.png' alt='Logo' />
                                    </Link>
                                    <p className={`app-name pl-4 ${isColaps ? 'colaps' : ''}`} id='app-name' ref={appNameRef}>
                                        DPPI BPIP RI
                                    </p>

                                    <button className={`btn-colaps ${isColaps ? 'colaps' : ''}`} id='btn-colaps' onClick={btnColaps}>
                                        <i className='px-1 py-1 fas fa-chevron-left cursor-pointer'></i>
                                    </button>
                                </div>
                                {user.role === 'Superadmin' || user.role === 'Administrator' || user.role === 'Admin Kesbangpol' ? (
                                    <div className='pt-4'>
                                        <Link
                                            href='/adminpanel'
                                            className={
                                                pathname === '/adminpanel'
                                                    ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                            }>
                                            <i className={pathname === '/adminpanel' ? 'mx-2 text-xl py-auto fas fa-home text-red-600' : 'mx-2 text-xl py-auto fas fa-home text-red-600'}></i>

                                            <p className='mx-1 menu-list' id='menu-name0'>
                                                Dashboard
                                            </p>
                                        </Link>

                                        <div className='flex mx-4'>
                                            <span className='w-10 dash-separator'></span>
                                            <p className='ml-2 menu-separator'>Input Data</p>
                                        </div>
                                        {user.role === 'Superadmin' || user.role === 'Administrator' ? (
                                            <>
                                                <div>
                                                    <Link
                                                        href='/adminpanel/video'
                                                        className={
                                                            pathname === '/adminpanel/video'
                                                                ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                                        }>
                                                        <i
                                                            className={
                                                                pathname === '/adminpanel/video'
                                                                    ? 'mx-2 text-xl py-auto fas fa-film text-red-600'
                                                                    : 'mx-2 text-xl py-auto fas fa-film text-red-600'
                                                            }></i>

                                                        <p className='mx-1 menu-list' id='menu-name0'>
                                                            Video
                                                        </p>
                                                    </Link>
                                                    <Link
                                                        href='/adminpanel/user'
                                                        className={
                                                            pathname === '/adminpanel/user'
                                                                ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                                        }>
                                                        <i
                                                            className={
                                                                pathname === '/adminpanel/user' ? 'mx-2 text-xl py-auto fas fa-user text-red-600' : 'mx-2 text-xl py-auto fas fa-user text-red-600'
                                                            }></i>

                                                        <p className='mx-1 menu-list' id='menu-name0'>
                                                            User
                                                        </p>
                                                    </Link>
                                                    <Link
                                                        href='/adminpanel/geowisata'
                                                        className={
                                                            regex.test(location.pathname)
                                                                ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                                        }>
                                                        <i
                                                            className={
                                                                regex.test(location.pathname)
                                                                    ? 'mx-2 text-xl py-auto fas fa-torii-gate text-red-600'
                                                                    : 'mx-2 text-xl py-auto fas fa-torii-gate text-red-600'
                                                            }></i>

                                                        <p className='mx-1 menu-list' id='menu-name0'>
                                                            Geowisata
                                                        </p>
                                                    </Link>
                                                    <Link
                                                        href='/adminpanel/geotourism-events'
                                                        className={
                                                            regex1.test(location.pathname)
                                                                ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                                : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                                        }>
                                                        <i
                                                            className={
                                                                regex1.test(location.pathname)
                                                                    ? 'mx-2 text-xl py-auto fas fa-calendar-check text-red-600'
                                                                    : 'mx-2 text-xl py-auto fas fa-calendar-check text-red-600'
                                                            }></i>

                                                        <p className='mx-1 menu-list' id='menu-name0'>
                                                            Event Wisata
                                                        </p>
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <div></div>
                                        )}
                                        {user.role === 'Superadmin' || user.role === 'Admin Kesbangpol' ? (
                                            <div>
                                                <Link
                                                    href='/adminpanel/data-wisatawan'
                                                    className={
                                                        pathname === '/adminpanel/data-wisatawan'
                                                            ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                            : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                                    }>
                                                    <i
                                                        className={
                                                            pathname === '/adminpanel/data-wisatawan'
                                                                ? 'mx-2 text-xl py-auto fas fa-users text-red-600'
                                                                : 'mx-2 text-xl py-auto fas fa-users text-red-600'
                                                        }></i>

                                                    <p className='mx-1 menu-list' id='menu-name0'>
                                                        Data Wisatawan
                                                    </p>
                                                </Link>
                                                <Link
                                                    href='/adminpanel/data-penelitian'
                                                    className={
                                                        pathname === '/adminpanel/data-penelitian'
                                                            ? 'active flex w-[95%] px-2 py-2 mx-2 font-semibold hover:rounded-md hover:bg-red-500/20 group1:'
                                                            : 'flex w-[95%] px-2 py-2 mx-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                                    }>
                                                    <i
                                                        className={
                                                            pathname === '/adminpanel/data-penelitian'
                                                                ? 'mx-2 text-xl py-auto fas fa-flask text-red-600'
                                                                : 'mx-2 text-xl py-auto fas fa-flask text-red-600'
                                                        }></i>

                                                    <p className='mx-1 ml-3 menu-list' id='menu-name0'>
                                                        Data Penelitian
                                                    </p>
                                                </Link>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                ) : (
                                    <div className='mt-4 w-full'>
                                        <Link
                                            href='/userpanel'
                                            className={
                                                pathname === '/userpanel'
                                                    ? 'active flex w-[95%] px-2 py-2 hover:rounded-md font-semibold hover:bg-red-500/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2  hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                            }>
                                            <i className={pathname === '/userpanel' ? 'mx-2 text-xl py-auto fas fa-home text-red-600' : 'mx-2 text-xl py-auto fas fa-home text-red-600'}></i>

                                            <p className='mx-1 menu-list' id='menu-name0'>
                                                Dashboard
                                            </p>
                                        </Link>

                                        <Link
                                            href='/userpanel/pengunjung'
                                            className={
                                                pathname === '/userpanel/pengunjung'
                                                    ? 'active flex w-[95%] px-2 py-2 hover:rounded-md font-semibold hover:bg-red-500/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/userpanel/pengunjung'
                                                        ? 'mx-2 text-xl py-auto fas fa-user-friends text-red-600'
                                                        : 'mx-2 text-xl py-auto fas fa-user-friends text-red-600'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name0'>
                                                Wisatawan
                                            </p>
                                        </Link>
                                        <Link
                                            href='/userpanel/harga-tiket'
                                            rel='prefetch'
                                            className={
                                                pathname === '/userpanel/harga-tiket'
                                                    ? 'active flex w-[95%] px-2 py-2 hover:rounded-md font-semibold hover:bg-red-500/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/userpanel/harga-tiket'
                                                        ? 'mx-2 text-xl py-auto fas fa-ticket-alt text-red-600'
                                                        : 'mx-2 text-xl py-auto fas fa-ticket-alt text-red-600'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name0'>
                                                Harga Tiket
                                            </p>
                                        </Link>
                                        <Link
                                            href='/userpanel/paket-wisata'
                                            rel='prefetch'
                                            className={
                                                pathname === '/userpanel/paket-wisata'
                                                    ? 'active flex w-[95%] px-2 py-2 hover:rounded-md font-semibold hover:bg-red-500/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/userpanel/paket-wisata'
                                                        ? 'mx-2 text-xl py-auto fas fa-plane-departure text-red-600'
                                                        : 'mx-2 text-xl py-auto fas fa-plane-departure text-red-600'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name0'>
                                                Paket Wisata
                                            </p>
                                        </Link>
                                        <Link
                                            href='/userpanel/order'
                                            rel='prefetch'
                                            className={
                                                pathname === '/userpanel/order'
                                                    ? 'active flex w-[95%] px-2 py-2 hover:rounded-md font-semibold hover:bg-red-500/20 group1:'
                                                    : 'flex w-[95%] px-2 py-2 hover:rounded-md hover:bg-red-500/20 text-red-600 dark:text-white'
                                            }>
                                            <i
                                                className={
                                                    pathname === '/userpanel/order'
                                                        ? 'mx-2 text-xl py-auto fas fa-plane-arrival text-red-600'
                                                        : 'mx-2 text-xl py-auto fas fa-plane-arrival text-red-600'
                                                }></i>

                                            <p className='mx-1 menu-list' id='menu-name0'>
                                                Kelola Pesanan
                                            </p>
                                        </Link>
                                    </div>
                                )}

                            </div>
                        </div>
                        <main className='main-content-dashboard' id='main-content' ref={mainContentRef}>
                            {children}
                        </main>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </main>
    );
}
