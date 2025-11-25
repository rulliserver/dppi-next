
import type { Metadata } from 'next';
import PdpBelumDiverifikasi from './PdpBelumDiverifikasi';
import AdminLayout from '@/app/Layouts/AdminLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Belum Diverifikasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <PdpBelumDiverifikasi />
        </AdminLayout>
    );
}
