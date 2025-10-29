function FormatDateTime(data: any) {
	const date = new Date(data);
	const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
	const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
	const dayIndex = date.getDay();
	const dayName = days[dayIndex];
	const day = date.getDate();
	const monthIndex = date.getMonth();
	const year = date.getFullYear();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const formattedDate = `${day} ${months[monthIndex]} ${year} ${hours}:${minutes} `;
	return formattedDate;
}

export default FormatDateTime;
