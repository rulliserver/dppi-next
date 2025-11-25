
import type { Metadata } from 'next';
import PdpBelumRegistrasi from './PdpBelumRegistrasi';
import AdminLayout from '@/app/Layouts/AdminLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Registrasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <PdpBelumRegistrasi />
        </AdminLayout>
    );
}
