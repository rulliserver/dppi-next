import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import DokterPage from './DokterPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Jurnal Dokter - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <DokterPage />
        </AdminLayout>
    );
}
