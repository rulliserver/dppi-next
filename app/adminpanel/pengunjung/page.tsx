import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import { RecentVisitors } from './Pengunjung';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Regulasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <RecentVisitors />
        </AdminLayout>
    );
}
