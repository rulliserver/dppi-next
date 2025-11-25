

import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import GaleriFotoEdit from './GaleriFotoEdit';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Edit Galeri Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <GaleriFotoEdit />
        </AdminLayout>
    );
}
