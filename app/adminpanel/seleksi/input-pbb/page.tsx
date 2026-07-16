import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import PbbPage from './PbbPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Input Penilaian PBB - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <PbbPage />
        </AdminLayout>
    );
}
