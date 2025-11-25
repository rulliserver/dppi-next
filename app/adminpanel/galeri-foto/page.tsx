

import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import GaleriFoto from './GaleriFoto';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Galeri Kegiatan - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <GaleriFoto />
        </AdminLayout>
    );
}
