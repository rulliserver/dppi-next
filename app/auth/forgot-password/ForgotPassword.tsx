'use client';

import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { UrlApi } from '../../components/apiUrl';
import InputError from '../../components/InputError';
import { ScaleLoader } from 'react-spinners';

const RECAPTCHA_SITE_KEY = '6LeemygqAAAAAJP7iYrptxnFS1gAmP9iwjx_Lydx';

function ForgotPasswordForm() {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!executeRecaptcha) {
            setError('reCAPTCHA belum siap. Muat ulang halaman, ya.');
            return;
        }

        try {
            setProcessing(true);

            const recaptcha_token = await executeRecaptcha('forgot_password');
            if (!recaptcha_token) {
                setError('Gagal mengambil token reCAPTCHA.');
                return;
            }

            const response = await fetch(`${UrlApi}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    recaptchaToken: recaptcha_token,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan');
            }

            setMessage(data.message);
            setEmail(''); // Reset email field

        } catch (err: any) {
            setError(err?.message || 'Terjadi kesalahan saat memproses permintaan');
        } finally {
            setProcessing(false);
        }
    };

    return (

        <div className="max-w-md w-full space-y-8">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Lupa Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Masukkan email Anda dan kami akan mengirim tautan reset password
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Masukkan email Anda"
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
                            'Kirim Tautan Reset'
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <a
                        href="/auth/login"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                        Kembali ke Login
                    </a>
                </div>
            </form>
        </div>

    );
}

export default function ForgotPasswordPage() {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={RECAPTCHA_SITE_KEY}
            scriptProps={{ async: true, defer: true }}
            container={{ element: 'recaptcha-badge', parameters: {} }}
        >
            <ForgotPasswordForm />
            <div className="absolute right-2 bottom-2" id="recaptcha-badge" />
        </GoogleReCaptchaProvider>
    );
}