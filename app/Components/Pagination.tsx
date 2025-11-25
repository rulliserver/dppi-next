// Pagination.tsx
import React from 'react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    onPageChange?: (url: any, page: number) => void;
}

export default function Pagination({ links, onPageChange }: PaginationProps) {
    function getClassName(active: boolean) {
        if (active) {
            return 'mr-[1px] mb-1 px-2 py-1 md:px-4 md:py-3 text-xs md:text-sm rounded hover:bg-red-500 focus:text-primary bg-red-700 text-white cursor-pointer';
        } else {
            return 'mr-[1px] mb-1 px-2 py-1 md:px-4 md:py-3 text-xs md:text-sm bg-gray-200 rounded hover:bg-gray-100 focus:text-primary dark:text-secondary cursor-pointer';
        }
    }

    // Process labels
    const processedLinks = links.map(link => {
        let label = link.label;
        if (label === '&laquo; Previous') {
            label = '<<';
        } else if (label === 'Next &raquo;') {
            label = '>>';
        }
        return { ...link, label };
    });

    const handleClick = (link: PaginationLink, event: React.MouseEvent) => {
        if (onPageChange && link.url) {
            event.preventDefault();
            // Extract page number from URL
            const urlParams = new URLSearchParams(link.url.split('?')[1]);
            const page = parseInt(urlParams.get('page') || '1');
            onPageChange(link.url, page);
        }
    };

    // Custom pagination logic untuk menampilkan lebih banyak halaman
    const renderCustomPagination = () => {
        if (links.length <= 7) {
            // Jika sedikit halaman, tampilkan semua
            return processedLinks;
        }

        const currentPageLink = links.find(link => link.active);
        const currentPage = currentPageLink ? parseInt(currentPageLink.label) || 0 : 1;

        const customLinks: PaginationLink[] = [];
        const totalPages = links.length - 2; // Exclude previous & next buttons

        // Previous button
        const prevLink = links[0];
        if (prevLink) {
            customLinks.push({ ...prevLink, label: '<<' });
        }

        // Always show first page
        customLinks.push(links[1]);

        // Calculate range to show
        let startPage = Math.max(2, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        // Adjust range if near boundaries
        if (currentPage <= 3) {
            endPage = Math.min(5, totalPages - 1);
        } else if (currentPage >= totalPages - 2) {
            startPage = Math.max(2, totalPages - 4);
        }

        // Show ellipsis after first page if needed
        if (startPage > 2) {
            customLinks.push({
                url: null,
                label: '...',
                active: false
            });
        }

        // Show middle pages
        for (let i = startPage; i <= endPage; i++) {
            if (links[i]) {
                customLinks.push(links[i]);
            }
        }

        // Show ellipsis before last page if needed
        if (endPage < totalPages - 1) {
            customLinks.push({
                url: null,
                label: '...',
                active: false
            });
        }

        // Always show last page
        if (totalPages > 1) {
            customLinks.push(links[totalPages]);
        }

        // Next button
        const nextLink = links[links.length - 1];
        if (nextLink) {
            customLinks.push({ ...nextLink, label: '>>' });
        }

        return customLinks;
    };

    const displayLinks = renderCustomPagination();

    return (
        displayLinks.length > 3 && (
            <div className='mb-4 text-center'>
                <div className='flex flex-wrap mt-8 justify-center'>
                    {displayLinks.map((link, key) =>
                        link.url === null ? (
                            <div
                                className='px-2 py-1 md:px-4 md:py-3 mb-1 mr-px text-sm leading-4 text-gray-400 dark:text-secondary rounded'
                                key={key}
                            >
                                {link.label}
                            </div>
                        ) : (
                            <a
                                className={getClassName(link.active)}
                                href={link.url}
                                onClick={(e) => handleClick(link, e)}
                                key={key}
                            >
                                {link.label}
                            </a>
                        )
                    )}
                </div>
            </div>
        )
    );
}
