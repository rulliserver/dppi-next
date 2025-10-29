

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import Profil from './Profile';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Profil - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <Profil />
        </GuestLayout>
    );
}
