import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import User from './User';
export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Users - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <User />
        </AdminLayout>
    );
}
