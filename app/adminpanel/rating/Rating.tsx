'use client'
import { UrlApi } from '@/app/components/apiUrl';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Rating {
    id: number;
    session_id: string;
    name: string | null;
    email: string | null;
    rating: number;
    suggestion: string;
    page_url: string;
    is_approved: boolean;
    created_at: string;
}

const RatingsAdmin: React.FC = () => {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchRatings();
    }, [page]);

    const fetchRatings = async () => {
        try {
            const response = await fetch(
                `${UrlApi}/ratings?page=${page}&limit=20&approved_only=false`
            );
            const data = await response.json();
            setRatings(data.ratings);
            // setTotalPages(data.pagination.total_pages);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const response = await fetch(`${UrlApi}/ratings/${id}/approve`, {
                method: 'PUT',
            });

            if (response.ok) {
                setRatings(ratings.filter(r => r.id !== id));
                toast.success('Rating approved');
            }
        } catch (error) {
            console.error('Error approving rating:', error);
            toast.error('Failed to approve rating');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this rating?')) return;

        try {
            const response = await fetch(`${UrlApi}/ratings/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRatings(ratings.filter(r => r.id !== id));
                toast.success('Rating deleted');
            }
        } catch (error) {
            console.error('Error deleting rating:', error);
            toast.error('Failed to delete rating');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Rating Management</h1>

            <div className="overflow-x-auto">
                <table className='w-full border-collapse text-sm'>
                    <thead className='bg-gray-100 dark:bg-gray-700'>
                        <tr>
                            <th className="py-3 px-4 border">#</th>
                            <th className="py-3 px-4 border">Nama</th>
                            <th className="py-3 px-4 border">Email</th>
                            <th className="py-3 px-4 border">Rating</th>
                            <th className="py-3 px-4 border">Saran/Kritik</th>
                            <th className="py-3 px-4 border">Tanggal</th>
                            <th className="py-3 px-4 border">Status</th>
                            <th className="py-3 px-4 border">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratings?.map((rating, index) => (
                            <tr key={rating.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 border">{index + 1}</td>
                                <td className="py-3 px-4 border">{rating.name || 'Anonymous'}</td>
                                <td className="py-3 px-4 border">{rating.email || 'Anonymous'}</td>
                                <td className="py-3 px-4 border">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`${i < rating.rating ? 'text-yellow-500' : 'text-gray-300'
                                                    }`}
                                            >
                                                <img src="/assets/images/ico-stars.svg" alt="bintang kosong" />
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 px-4 border max-w-xs truncate">
                                    {rating.suggestion}
                                </td>

                                <td className="py-3 px-4 border">
                                    {new Date(rating.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 border">
                                    <span className={`px-2 py-1 rounded text-xs ${rating.is_approved
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {rating.is_approved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 border">
                                    <div className="flex space-x-2">
                                        {!rating.is_approved && (
                                            <button
                                                onClick={() => handleApprove(rating.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(rating.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-4 py-2">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div >
    );
};

export default RatingsAdmin;