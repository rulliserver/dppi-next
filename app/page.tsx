import Beranda from './Beranda';
import GuestLayout from './Layouts/GuestLayout';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Laman Resmi Duta Pancasila Paskibraka Indonesia - DPPI BPIP RI'
    };
}

export default function Home() {
    return (
        <GuestLayout>
            <Beranda />
        </GuestLayout>
    );
}
