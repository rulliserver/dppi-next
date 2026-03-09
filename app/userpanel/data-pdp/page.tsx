
import type { Metadata } from 'next';
import DataPdp from './DataPdp';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Diverifikasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <DataPdp />
        </UserLayout>
    );
}
