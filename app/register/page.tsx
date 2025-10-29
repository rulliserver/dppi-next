

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import Register from './Register';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Registrasi - DPPI BPIP RI'
    };
}
export default function Page() {
    return (
        <GuestLayout>
            <Register />
        </GuestLayout>
    );
}
