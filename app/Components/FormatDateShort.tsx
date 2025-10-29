function FormatDateShort(tanggal: any) {
    const date = new Date(tanggal); // Mengubah string tanggal menjadi Date object
    const day = String(date.getDate()).padStart(2, '0'); // Mengambil hari
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mengambil bulan (ditambah 1 karena bulan dimulai dari 0)
    const year = date.getFullYear(); // Mengambil tahun
    return `${day}-${month}-${year}`; // Menggabungkan menjadi format "DD-MM-YYYY"
}
export default FormatDateShort;
