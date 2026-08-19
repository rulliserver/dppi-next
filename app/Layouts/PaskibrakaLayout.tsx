'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Swal from 'sweetalert2';
import { UrlApi } from '@/app/components/apiUrl';
import { useUser } from '@/app/components/UserContext';
import darkMode from '@/app/components/DarkMode';

export default function PaskibrakaLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, setUser } = useUser();
    const [colorTheme, setTheme] = darkMode();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Verify User Role
    const fetchUser = useCallback(async () => {
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

            const adminRoles = [
                'Superadmin', 'Administrator', 'Admin Kesbangpol', 'Admin Pendaftaran', 'Admin Penilaian', 'Admin Pemusatan'
            ];
            if (adminRoles.includes(data.role)) {
                window.location.href = '/adminpanel';
            }
        } catch (err) {
            console.error(err);
        }
    }, [setUser]);

    useEffect(() => {
        if (!user) fetchUser();
    }, [user, fetchUser]);

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Yakin ingin logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${UrlApi}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
                setUser(null);
                localStorage.removeItem('access_token');
                window.location.href = '/auth/login';
            } catch (err) {
                console.error(err);
                window.location.href = '/auth/login';
            }
        }
    };

    const navigationMenus = [
        {
            name: 'Profile',
            href: '/paskibraka-panel/profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: 'Tugas Bulanan',
            href: '/paskibraka-panel/tugas',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            name: 'Informasi',
            href: '/paskibraka-panel/informasi',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            )
        },
        {
            name: 'Pengumpulan Tugas',
            href: '/paskibraka-panel/pengumpulan-tugas',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            )
        },
        {
            name: 'Penilaian',
            href: '/paskibraka-panel/penilaian',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            name: 'Ubah Password',
            href: '/paskibraka-panel/change-password',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
            {/* Top Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <Link href="/paskibraka-panel/profile" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-red-500/20">
                                P
                            </div>
                            <div>
                                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                                    Paskibraka<span className="text-red-600 dark:text-red-500">Panel</span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Dark mode toggle */}
                        <button
                            onClick={() => setTheme(colorTheme)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            title="Toggle Theme"
                        >
                            {colorTheme === 'light' ? (
                                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        {/* User Profile Header Badge */}
                        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center border border-red-200">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                    {user?.name || 'Anggota Paskibraka'}
                                </p>
                                <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full">
                                    Paskibraka
                                </span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 transition font-medium text-sm flex items-center gap-1.5"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <aside className={`hidden lg:block bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 w-64 transition-all duration-200 shrink-0`}>
                    <div className="p-4 space-y-1 sticky top-16">
                        <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                            Menu Paskibraka
                        </p>
                        {navigationMenus.map((menu) => {
                            const isActive = pathname === menu.href || pathname?.startsWith(menu.href + '/');
                            return (
                                <Link
                                    key={menu.href}
                                    href={menu.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                        isActive
                                            ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                                    }`}
                                >
                                    <span>{menu.icon}</span>
                                    <span>{menu.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <div
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                        <div className="relative bg-white dark:bg-slate-800 w-72 max-w-full p-4 flex flex-col h-full shadow-2xl z-10">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Menu Navigation</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="space-y-1.5 flex-1">
                                {navigationMenus.map((menu) => {
                                    const isActive = pathname === menu.href || pathname?.startsWith(menu.href + '/');
                                    return (
                                        <Link
                                            key={menu.href}
                                            href={menu.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                                                isActive
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            <span>{menu.icon}</span>
                                            <span>{menu.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={logout}
                                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-sm shadow-md hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 w-full p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
