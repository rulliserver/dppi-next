import type { Metadata } from 'next';

import ForgotPasswordPage from './ForgotPassword';
import AuthLayout from '@/app/Layouts/AuthLayout';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Berita - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AuthLayout>
            <ForgotPasswordPage />
        </AuthLayout>
    );
}
