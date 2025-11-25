import type { PropsWithChildren } from 'react';
import AppLogo from '../Components/ApplicationLogo';
import Link from 'next/link';

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className='min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-500'>
            <Link href={'/'}>
                <AppLogo />
            </Link>
            <div className='w-full sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-900 shadow-md overflow-hidden sm:rounded-lg'>{children}</div>
        </div>
    );
}
