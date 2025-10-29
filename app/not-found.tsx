import Link from 'next/link';

export default function NotFound() {
    return (
        <div>
            <main className='bg-white min-h-screen dark:bg-gray-900'>
                <section className='error-page'>
                    <div className='mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-16'>
                        <div className='mx-auto max-w-screen-sm text-center'>
                            <h1 className='mb-4 text-7xl font-extrabold tracking-tight text-red-600 lg:text-9xl dark:text-red-500'>404</h1>
                            <p className='mb-4 font-semibold tracking-tight text-lg text-gray-900'>
                                Maaf, kami tidak dapat menemukan halaman tersebut. Anda akan menemukan banyak hal untuk dijelajahi di beranda.
                            </p>
                            {/* <p className='mb-4 text-lg font-light text-gray-800'>{details}</p> */}
                            <Link href='/' className='error-button hover:underline hover:text-red-500'>
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
