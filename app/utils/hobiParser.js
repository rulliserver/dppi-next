// utils/hobiParser.js
export const parseHobi = (hobiData) => {
    if (!hobiData) return [];
    
    try {
        // Coba parse sebagai JSON
        const parsed = JSON.parse(hobiData);
        
        if (Array.isArray(parsed)) {
            return parsed;
        } else if (typeof parsed === 'string') {
            // Jika hasil parse adalah string, split by koma
            return parsed.split(',').map(item => item.trim()).filter(item => item);
        } else {
            return [];
        }
    } catch (error) {
        // Jika bukan JSON, treat sebagai string biasa
        if (typeof hobiData === 'string') {
            return hobiData.split(',').map(item => item.trim()).filter(item => item);
        }
        return [];
    }
};