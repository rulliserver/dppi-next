
import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import PdpTidakAktif from './PdpTidakAktif';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Diverifikasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <PdpTidakAktif />
        </UserLayout>
    );
}
