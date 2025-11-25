'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { UrlApi } from '../../components/apiUrl';
import InputError from '../../components/InputError';
import { ScaleLoader } from 'react-spinners';

const RECAPTCHA_SITE_KEY = '6LeemygqAAAAAJP7iYrptxnFS1gAmP9iwjx_Lydx';

function ResetPasswordForm() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Token reset password tidak valid');
            setTokenValid(false);
        } else {
            setTokenValid(true);
        }
    }, [token]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Password baru dan konfirmasi password tidak sama');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (!executeRecaptcha) {
            setError('reCAPTCHA belum siap. Muat ulang halaman, ya.');
            return;
        }

        try {
            setProcessing(true);

            const recaptcha_token = await executeRecaptcha('reset_password');
            if (!recaptcha_token) {
                setError('Gagal mengambil token reCAPTCHA.');
                return;
            }

            const response = await fetch(`${UrlApi}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    new_password: formData.newPassword,
                    confirm_password: formData.confirmPassword,
                    recaptchaToken: recaptcha_token,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan');
            }

            setMessage('Password berhasil direset! Redirecting...');

            // Redirect ke login setelah 3 detik
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);

        } catch (err: any) {
            setError(err?.message || 'Terjadi kesalahan saat reset password');
        } finally {
            setProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (tokenValid === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600">Token Tidak Valid</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Token reset password tidak valid atau sudah kadaluarsa.
                        </p>
                        <a
                            href="/forgot-password"
                            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
                        >
                            Minta tautan reset baru
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (

        <div className="max-w-md w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Masukkan password baru Anda
                </p>
            </div>

            {error && <InputError message={error} />}
            {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    {message}
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={submit}>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Password Baru
                    </label>
                    <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Masukkan password baru"
                        minLength={6}
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Konfirmasi Password Baru
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Konfirmasi password baru"
                        minLength={6}
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="flex items-center">
                                <ScaleLoader barCount={3} height={16} color="white" />
                                <span className="ml-2">Memproses...</span>
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <a
                        href="/login"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        Kembali ke Login
                    </a>
                </div>
            </form>
        </div>

    );
}

export default function ResetPasswordPage() {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={RECAPTCHA_SITE_KEY}
            scriptProps={{ async: true, defer: true }}
            container={{ element: 'recaptcha-badge', parameters: {} }}
        >
            <ResetPasswordForm />
            <div className="absolute right-2 bottom-2" id="recaptcha-badge" />
        </GoogleReCaptchaProvider>
    );
}