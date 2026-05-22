

import type { Metadata } from 'next';
import GuestLayout from '../Layouts/GuestLayout';
import Sipena from './Sipena';


export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'SIPENA - DPPI BPIP RI'
    };
}
export default function Page() {
    return (

            <Sipena />

    );
}
