import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import PelatihPage from './PelatihPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Jurnal Pelatih - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <PelatihPage />
        </AdminLayout>
    );
}
