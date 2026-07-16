import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import PsikotesPage from './PsikotesPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Penilaian Psikotes - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <PsikotesPage />
        </AdminLayout>
    );
}
