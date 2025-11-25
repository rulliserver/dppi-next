

import type { Metadata } from 'next';
import GuestLayout from '@/app/Layouts/GuestLayout';
import AdminLayout from '@/app/Layouts/AdminLayout';
import BeritaCreate from './BeritaCreate';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Berita - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <BeritaCreate />
        </AdminLayout>
    );
}
