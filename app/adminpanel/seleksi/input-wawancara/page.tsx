import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import WawancaraPage from './WawancaraPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Penilaian Wawancara - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <WawancaraPage />
        </AdminLayout>
    );
}
