import UserLayout from '../Layouts/UserLayout';
import DashboardUser from './DashboardUser';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Dashboard - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <DashboardUser />
        </UserLayout>
    );
}
