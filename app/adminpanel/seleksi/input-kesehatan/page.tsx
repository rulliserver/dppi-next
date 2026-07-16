import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import KesehatanPage from './KesehatanPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Penilaian Kesehatan - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <KesehatanPage />
        </AdminLayout>
    );
}
