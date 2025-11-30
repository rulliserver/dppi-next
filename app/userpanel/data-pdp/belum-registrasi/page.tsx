
import type { Metadata } from 'next';
import PdpBelumRegistrasi from './PdpBelumRegistrasi';
import AdminLayout from '@/app/Layouts/AdminLayout';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Registrasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <PdpBelumRegistrasi />
        </UserLayout>
    );
}
