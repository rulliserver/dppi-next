function FormatLongMonthYear(data: any) {
	const date = new Date(data);

	const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

	const monthIndex = date.getMonth();
	const year = date.getFullYear();
	const formattedDate = `${months[monthIndex]} ${year}`;
	return formattedDate;
}

export default FormatLongMonthYear;
