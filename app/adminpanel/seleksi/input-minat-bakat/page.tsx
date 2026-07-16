import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import MinatBakatPage from './MinatBakatPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Penilaian Minat Bakat - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <MinatBakatPage />
        </AdminLayout>
    );
}
