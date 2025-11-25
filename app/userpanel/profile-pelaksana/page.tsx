
import type { Metadata } from 'next';

import ProfilePelaksana from './ProfilePelaksana';
import UserLayout from '@/app/Layouts/UserLayout';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Profile Pelaksana - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <UserLayout>
            <ProfilePelaksana />
        </UserLayout>
    );
}
