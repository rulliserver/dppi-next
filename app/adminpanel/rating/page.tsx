import type { Metadata } from 'next';
import AdminLayout from '@/app/Layouts/AdminLayout';
import RatingsAdmin from './Rating';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Rating - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <AdminLayout>
            <RatingsAdmin />
        </AdminLayout>
    );
}
