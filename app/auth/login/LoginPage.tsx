'use client';
import { useState, useEffect, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { UrlApi } from '../../components/apiUrl';
import InputError from '../../components/InputError';
import Checkbox from '../../components/Checkbox';
import { useUser } from '../../components/UserContext';
import { ScaleLoader } from 'react-spinners';

type LoginResponse =
    | { access_token: string; user: { role: string;[k: string]: any } }
    | { role: string; access_token?: string;[k: string]: any }; // jaga-jaga skema lama

const RECAPTCHA_SITE_KEY = '6LeemygqAAAAAJP7iYrptxnFS1gAmP9iwjx_Lydx';

function LoginForm() {
    const { setUser } = useUser();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [dataUser, setDataUser] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

    const checkAuth = useCallback(async () => {
        try {
            const token = getToken();

            const response = await fetch(`${UrlApi}/user`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);

                const role = userData.role;
                const adminRoles = [
                    'Superadmin', 'Administrator', 'Admin Kesbangpol', 'Admin Pendaftaran', 'Admin Penilaian', 'Admin Pemusatan',
                    'Jurnalis', 'Juri PBB', 'Juri Minat Bakat', 'Pewawancara', 'Dokter Penilai', 'Pamong', 'Pelatih', 'Dokter'
                ];
                if (adminRoles.includes(role)) {
                    window.location.href = '/adminpanel';
                } else {
                    window.location.href = '/userpanel';
                }
            }

        } catch (error) {
            console.error('Failed to check auth:', error);
        }
    }, [setUser]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataUser({ ...dataUser, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!executeRecaptcha) {
            setErrorMessage('Sistem keamanan belum siap, silakan refresh halaman.');
            return;
        }

        try {
            setProcessing(true);
            const recaptchaToken = await executeRecaptcha('login');

            const res = await fetch(`${UrlApi}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: dataUser.email,
                    password: dataUser.password,
                    recaptchaToken,
                }),
            });

            if (!res.ok) throw new Error('Email atau password salah');

            const json = await res.json();

            if (json.access_token) {
                localStorage.setItem('access_token', json.access_token);
            }

            // Ambil detail user setelah login
            const me = await fetch(`${UrlApi}/user`, {
                headers: {
                    Authorization: `Bearer ${json.access_token}`,
                },
                credentials: 'include'
            });

            const user = await me.json();
            setUser(user);

            const role = user.role || 'User';
            const adminRoles = [
                'Superadmin', 'Administrator', 'Admin Kesbangpol', 'Admin Pendaftaran', 'Admin Penilaian', 'Admin Pemusatan',
                'Jurnalis', 'Juri PBB', 'Juri Minat Bakat', 'Pewawancara', 'Dokter Penilai', 'Pamong', 'Pelatih', 'Dokter'
            ];
            window.location.href = adminRoles.includes(role)
                  ? '/adminpanel'
                  : '/userpanel';

        } catch (err: any) {
            setErrorMessage(err.message || 'Login gagal, coba lagi.');
        } finally {
            setProcessing(false);
        }
    };



    return (
        <div>
            {errorMessage && <InputError message={errorMessage} />}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='email' className='block font-medium text-sm text-gray-700 dark:text-gray-200'>
                        Email
                    </label>
                    <input
                        id='email'
                        type='email'
                        name='email'
                        value={dataUser.email}
                        className='dark:bg-black border-gray-300 border rounded-md shadow-sm dark:text-gray-200 px-2 py-1 block w-full mt-1'
                        autoComplete='email'
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className='mt-4'>
                    <label htmlFor='password' className='block font-medium text-sm text-gray-700 dark:text-gray-200'>
                        Password
                    </label>
                    <div className='relative mt-1'>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            value={dataUser.password}
                            className='dark:bg-black border-gray-300 border rounded-md shadow-sm dark:text-gray-200 pl-2 pr-10 py-1 block w-full'
                            autoComplete='current-password'
                            onChange={handleChange}
                            required
                        />
                        <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200'
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className='block mt-4'>
                    <label className='flex items-center'>
                        <Checkbox name='remember' />
                        <span className='text-sm text-gray-600 ms-2 dark:text-gray-200'>Remember me</span>
                    </label>
                </div>

                <div className='flex flex-row justify-between'>
                    <div className="flex items-center justify-between mt-4">
                        <a
                            href="/auth/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            Lupa Password?
                        </a>
                    </div>
                    <button type='submit' className='cursor-pointer ms-4 bg-blue-600 dark:text-gray-200 text-white px-4 py-1 rounded-lg'>
                        {processing ? (
                            <div className='flex flex-row items-center'>
                                <ScaleLoader barCount={3} height={24} color='red' />
                                <span className='ml-2'>Loading</span>
                            </div>
                        ) : (
                            'Login'
                        )}
                    </button>
                </div>
            </form>
        </div>

    );
}

export default function LoginPage() {
    return (

        <GoogleReCaptchaProvider
            reCaptchaKey={RECAPTCHA_SITE_KEY}
            scriptProps={{ async: true, defer: true }}
            container={{ element: 'recaptcha-badge', parameters: {} }}
        >
            <LoginForm />
            <div className='absolute right-2 bottom-2' id='recaptcha-badge' />
        </GoogleReCaptchaProvider>

    );
}
