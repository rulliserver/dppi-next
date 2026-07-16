'use client'

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    limit,
    total,
    onPageChange,
    onLimitChange
}: PaginationProps) {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots: any = [];
        let l: any;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-650 dark:text-white">Tampilkan</span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(parseInt(e.target.value))}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-800 text-xs"
                    >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-xs text-gray-655 dark:text-white">data</span>
                </div>
                <span className="text-xs text-black dark:text-white font-medium">
                    Menampilkan {total > 0 ? (currentPage - 1) * limit + 1 : 0} - {Math.min(currentPage * limit, total)} dari {total} data
                </span>
                <div className="flex gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs transition-colors dark:text-gray-800"
                    >
                        Previous
                    </button>
                    {(() => {
                        return getPageNumbers().map((page: any, index: any) => (
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => onPageChange(page)}
                                    className={`px-3 py-1 rounded border text-xs transition-colors ${currentPage === page
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-gray-300 bg-white hover:bg-gray-100 dark:text-gray-800'
                                        }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={index} className="px-3 py-1 text-gray-400 text-xs">
                                    {page}
                                </span>
                            )
                        ));
                    })()}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 text-xs transition-colors dark:text-gray-800"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}
