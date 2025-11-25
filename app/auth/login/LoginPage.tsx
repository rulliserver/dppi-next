'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { UrlApi } from '../../Components/apiUrl';
import InputError from '../../Components/InputError';
import Checkbox from '../../Components/Checkbox';
import { useUser } from '../../Components/UserContext';
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
                if (role === 'Superadmin' || role === 'Administrator' || role === 'Admin Kesbangpol') {
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

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!executeRecaptcha) {
            setErrorMessage('reCAPTCHA belum siap. Muat ulang halaman, ya.');
            return;
        }

        try {
            setProcessing(true);

            // DAPATKAN TOKEN reCAPTCHA v3
            const recaptcha_token = await executeRecaptcha('login');
            if (!recaptcha_token) {
                setProcessing(false);
                setErrorMessage('Gagal mengambil token reCAPTCHA.');
                return;
            }


            const loginResponse = await fetch(`${UrlApi}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: dataUser.email,
                    password: dataUser.password,
                    recaptchaToken: recaptcha_token,
                }),
            });

            if (!loginResponse.ok) {
                const errText = await loginResponse.text();
                throw new Error(errText || 'Login gagal.');
            }

            const loginData: LoginResponse = await loginResponse.json();

            // Simpan access_token jika ada
            const token =
                (loginData as any).access_token ??
                (typeof loginData === 'object' && 'access_token' in loginData ? (loginData as any).access_token : null);

            if (token) {
                localStorage.setItem('access_token', token);
            }

            // Ambil user sesudah login (pakai token baru)
            await checkAuth();
        } catch (err: any) {
            setErrorMessage(err?.message || 'Terjadi kesalahan saat login');
        } finally {
            setProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataUser({ ...dataUser, [e.target.name]: e.target.value });
    };

    return (
        <div>
            {errorMessage && <InputError message={errorMessage} />}
            <form onSubmit={submit}>
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
                    <input
                        id='password'
                        type='password'
                        name='password'
                        value={dataUser.password}
                        className='dark:bg-black border-gray-300 border rounded-md shadow-sm dark:text-gray-200 px-2 py-1 block w-full mt-1'
                        autoComplete='current-password'
                        onChange={handleChange}
                        required
                    />
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
