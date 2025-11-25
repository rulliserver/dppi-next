
import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import PdpTidakAktif from './PdpTidakAktif';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Diverifikasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <PdpTidakAktif />
        </AdminLayout>
    );
}
