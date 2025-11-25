import type { Metadata } from 'next';
import AuthLayout from '@/app/Layouts/AuthLayout';
import ResetPasswordPage from './ResetPassword';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Berita - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AuthLayout>
            <ResetPasswordPage />
        </AuthLayout>
    );
}
