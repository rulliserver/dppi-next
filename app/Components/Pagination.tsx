// Pagination.tsx
import React from 'react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    onPageChange: (page: number) => void;
    currentPage: number;
    lastPage: number;
}

export default function Pagination({ links, onPageChange, currentPage, lastPage }: PaginationProps) {
    function getClassName(active: boolean) {
        if (active) {
            return 'mr-[1px] mb-1 px-2 py-1 md:px-4 md:py-3 text-xs md:text-sm  rounded hover:bg-red-500 focus:border-primary focus:text-primary bg-red-700 text-white cursor-pointer';
        } else {
            return 'mr-[1px] mb-1 px-2 py-1 md:px-4 md:py-3 text-xs md:text-sm  bg-gray-200 rounded hover:bg-gray-100 focus:border-primary focus:text-primary dark:text-secondary cursor-pointer';
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

    const handleClick = (link: PaginationLink) => {
        if (link.url && !link.active) {
            // Extract page number from URL
            const urlParams = new URLSearchParams(link.url.split('?')[1]);
            const page = parseInt(urlParams.get('page') || '1');
            onPageChange(page);
        }
    };

    return (
        links.length > 3 && (
            <div className='mb-4 text-center'>
                <div className='flex flex-wrap mt-8 justify-center'>
                    {processedLinks.map((link, key) =>
                        link.url === null ? (
                            <div
                                className='px-2 py-1 md:px-4 md:py-3 mb-1 mr-px text-sm leading-4 text-gray-400 dark:text-secondary rounded'
                                key={key}
                            >
                                {link.label}
                            </div>
                        ) : (
                            <button
                                className={getClassName(link.active)}
                                onClick={() => handleClick(link)}
                                key={key}
                                disabled={link.active}
                            >
                                {link.label}
                            </button>
                        )
                    )}
                </div>

                {/* Page info */}
                <div className='mt-2 text-sm text-gray-600'>
                    Page {currentPage} of {lastPage}
                </div>
            </div>
        )
    );
}