import type { Metadata } from 'next';
import ProfileUser from './ProfileUser';

import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Profile User - DPPI BPIP RI'
    };
}

export default function Page() {
    return (
        <UserLayout>
            <ProfileUser />
        </UserLayout>
    );
}
