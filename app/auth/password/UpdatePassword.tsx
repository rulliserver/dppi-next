'use client';

import { UrlApi } from '@/app/Components/apiUrl';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
import Swal from 'sweetalert2';

export default function UpdatePassword() {
	const [editData, setEditData]: any = useState({
		old_password: '',
		new_password: '',
		confirm_password: ''
	});

	const [showPassword, setShowPassword] = useState({
		old: false,
		new: false,
		confirm: false
	});
	const [processing, setProcessing] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditData({ ...editData, [e.target.name]: e.target.value });
	};

	const togglePassword = (key: 'old' | 'new' | 'confirm') => {
		setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setProcessing(true);

		if (editData.confirm_password && editData.new_password !== editData.confirm_password) {
			Swal.fire({
				icon: 'error',
				text: 'Konfirmasi Password Tidak Sesuai',
				allowOutsideClick: false,
				allowEscapeKey: false,
				showConfirmButton: true,
				confirmButtonText: 'Kembali',
				confirmButtonColor: '#2563eb'
			});
			setProcessing(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append('old_password', editData.old_password);
			formData.append('password', editData.new_password);

			const response = await fetch(`${UrlApi}/auth/update-password`, {
				method: 'put',
				credentials: 'include',
				body: formData
			});
			if (response.ok) {
				Swal.fire({
					icon: 'success',
					text: 'Password Berhasil diupdate',
					allowOutsideClick: false,
					allowEscapeKey: false,
					showConfirmButton: true,
					confirmButtonText: 'Kembali',
					confirmButtonColor: '#2563eb'
				}).then((result) => {
					if (result.isConfirmed) {
						window.location.href = '/userpanel';
					}
				});
			} else {
				const errorData = await response.json();
				Swal.fire({
					icon: 'error',
					text: errorData.message || 'Gagal memperbarui password',
					allowOutsideClick: false,
					allowEscapeKey: false,
					showConfirmButton: true,
					confirmButtonText: 'Kembali',
					confirmButtonColor: '#2563eb'
				});
			}
		} catch (error) {
			console.error('Error:', error);
			Swal.fire({
				icon: 'error',
				text: 'Terjadi kesalahan saat memperbarui password',
				allowOutsideClick: false,
				allowEscapeKey: false,
				showConfirmButton: true,
				confirmButtonText: 'Kembali',
				confirmButtonColor: '#2563eb'
			});
		} finally {
			setProcessing(false);
		}
	};

	const renderPasswordInput = (label: string, name: string, typeKey: 'old' | 'new' | 'confirm') => (
		<div className='grid lg:grid-cols-5 gap-2 mt-4 items-center'>
			<label className='text-sm col-span-2'>{label}</label>
			<div className='relative col-span-3'>
				<input
					type={showPassword[typeKey] ? 'text' : 'password'}
					name={name}
					value={editData[name]}
					onChange={handleChange}
					className='form-control-admin-bp w-full pr-10'
					required={name === 'old_password'}
				/>
				<button type='button' onClick={() => togglePassword(typeKey)} className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600'>
					{showPassword[typeKey] ? <i className='text-orange-500 fa fa-eye' /> : <i className='text-orange-500 fa fa-eye-slash' />}
				</button>
			</div>
		</div>
	);

	return (
		<div>
			<div className='py-4'>
				<div className='text-gray-900 flex flex-row justify-between mx-2'>
					<div className='flex flex-row'>
						<i className='text-orange-600 fa fa-lock-open text-2xl md:text-4xl pr-2'></i>
						<p className='text-sm md:text-xl py-1 font-semibold text-orange-600'>UPDATE PASSWORD</p>
					</div>
				</div>
			</div>

			<div className='relative p-0 overflow-hidden max-w-lg rounded-md shadow-sm shadow-gray-500 mr-2 dark:border-orange-500 border'>
				<form onSubmit={handleSubmit}>
					<div className='px-4 py-2 text-dark dark:text-white'>
						{renderPasswordInput('Password Lama:', 'old_password', 'old')}
						{renderPasswordInput('Password Baru:', 'new_password', 'new')}
						{renderPasswordInput('Konfirmasi Password Baru:', 'confirm_password', 'confirm')}
					</div>
					<div className='flex justify-between px-4 pb-2 border-t-2 border-white'>
						<Link href='/userpanel' className='cursor-pointer px-8 py-2 mt-2 text-white bg-orange-500 rounded-md'>
							Batal
						</Link>
						<button type='submit' className='cursor-pointer px-8 py-2 mt-2 text-white bg-green-600 hover:bg-green-800 rounded-md'>
							{processing ? (
								<div className='flex flex-row'>
									<ScaleLoader barCount={3} height={24} color='#ffb000' />
									&nbsp; Loading{' '}
								</div>
							) : (
								'Submit'
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
