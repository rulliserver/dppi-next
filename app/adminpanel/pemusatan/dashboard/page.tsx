import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import PemusatanDashboardPage from './PemusatanDashboardPage';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Dashboard Pemusatan - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <AdminLayout>
            <PemusatanDashboardPage />
        </AdminLayout>
    );
}
