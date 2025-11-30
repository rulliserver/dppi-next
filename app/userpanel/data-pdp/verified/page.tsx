
import type { Metadata } from 'next';

import AdminLayout from '@/app/Layouts/AdminLayout';
import PdpVerified from './PdpVerified';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'PDP Verified - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <PdpVerified />
        </UserLayout>
    );
}
