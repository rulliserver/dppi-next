import LoginPage from '@/app/auth/login/LoginPage';
import AuthLayout from '@/app/Layouts/AuthLayout';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'login - DPPI BPIP RI'
	};
}

export default function Page() {
	return (
		<AuthLayout>
			<LoginPage />
		</AuthLayout>
	);
}
