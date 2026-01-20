import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import Pengumuman from './Pengumuman';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Pengumuman - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <Pengumuman />
        </AdminLayout>
    );
}
