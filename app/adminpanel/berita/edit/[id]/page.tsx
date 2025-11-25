import type { Metadata } from 'next';
import GuestLayout from '@/app/Layouts/GuestLayout';
import BeritaEdit from './BeritaEdit';
import AdminLayout from '@/app/Layouts/AdminLayout';
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Berita - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <BeritaEdit />
        </AdminLayout>
    );
}
