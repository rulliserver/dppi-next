
import type { Metadata } from 'next';
import PdpBelumDiverifikasi from './PdpBelumDiverifikasi';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Diverifikasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <PdpBelumDiverifikasi />
        </UserLayout>
    );
}
