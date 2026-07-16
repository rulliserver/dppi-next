import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import PamongPage from './PamongPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Jurnal Pamong - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <PamongPage />
        </AdminLayout>
    );
}
