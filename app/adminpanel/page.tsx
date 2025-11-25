import AdminLayout from '../Layouts/AdminLayout';
import Dashboard from './Dashboard';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Dashboard - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <Dashboard />
        </AdminLayout>
    );
}
