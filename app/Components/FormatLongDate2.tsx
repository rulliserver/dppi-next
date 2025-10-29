function FormatLongDate2(props: any) {
	const date = new Date(props);
	const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
	const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
	const dayIndex = date.getDay();
	const dayName = days[dayIndex];
	const day = date.getDate();
	const monthIndex = date.getMonth();
	const year = date.getFullYear();
	const formattedDate = `${dayName}, ${day} ${months[monthIndex]} ${year}`;
	return formattedDate;
}

export default FormatLongDate2;
