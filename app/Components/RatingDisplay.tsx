import React, { useEffect, useState } from 'react';
import { UrlApi } from './apiUrl';

interface RatingDisplayProps {
    siteName?: string;
    // Optional: Jika ingin fetch dari API langsung
    apiUrl?: string;
}

interface RatingStats {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
        stars: number;
        count: number;
        percentage: number;
    }[];
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
    siteName = "Website DPPI BPIP",
    apiUrl = `${UrlApi}/ratings/stats`
}) => {
    const [stats, setStats] = useState<RatingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRatingStats();
    }, []);

    const fetchRatingStats = async () => {
        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Transform data dari backend ke format yang dibutuhkan
            const ratingStats: RatingStats = {
                averageRating: data.average_rating || 0,
                totalRatings: data.total_ratings || 0,
                ratingDistribution: data.rating_distribution || []
            };

            setStats(ratingStats);
            setError(null);
        } catch (err) {
            console.error('Error fetching rating stats:', err);
            setError(err instanceof Error ? err.message : 'Gagal memuat data rating');
            // Set default stats jika error
            setStats({
                averageRating: 0,
                totalRatings: 0,
                ratingDistribution: Array.from({ length: 5 }, (_, i) => ({
                    stars: 5 - i,
                    count: 0,
                    percentage: 0
                }))
            });
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk render bintang dengan fraksi
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const fraction = rating - fullStars;

        // 1. Bintang Penuh
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <li key={`full-${i}`} className="active">
                    <img src="/assets/images/ico-stars.svg" alt="bintang" />
                </li>
            );
        }

        // 2. Bintang Fraksi (Hanya jika belum mencapai 5 bintang)
        if (stars.length < 5) {
            let fractionClass = "";
            if (fraction >= 0.1 && fraction <= 0.3) fractionClass = "seperapat";
            else if (fraction >= 0.4 && fraction <= 0.6) fractionClass = "setengah";
            else if (fraction >= 0.7) fractionClass = "tigaperempat";

            if (fractionClass) {
                stars.push(
                    <li key="fraction" className={`active ${fractionClass}`}>
                        <img src="/assets/images/ico-stars.svg" alt={`bintang ${fractionClass}`} />
                    </li>
                );
            }
        }

        // 3. Bintang Kosong (Abu-abu) - Melengkapi sampai 5
        const currentLength = stars.length;
        for (let i = 0; i < (5 - currentLength); i++) {
            stars.push(
                <li key={`empty-${i}`} className="star-gray">
                    <img src="/assets/images/ico-stars.svg" alt="bintang kosong" style={{ filter: 'grayscale(100%)', opacity: 0.3 }} />
                </li>
            );
        }

        return stars;
    };

    if (loading) {
        return (
            <div className="row d-flex">
                <div className="col-md-5">
                    <div className="circle-survey placeholder-glow">
                        <h2 className="placeholder col-4"></h2>
                        <ul className="stars" style={{ marginRight: '25pt' }}>
                            {[...Array(5)].map((_, i) => (
                                <li key={i} className="placeholder">
                                    <div className="placeholder" style={{ width: '20px', height: '20px' }}></div>
                                </li>
                            ))}
                        </ul>
                        <p className="placeholder col-6"></p>
                    </div>
                </div>
            </div>
        );
    }

    const hasRatings = stats && stats.totalRatings > 0;
    const averageRating = stats?.averageRating || 0;
    const totalRatings = stats?.totalRatings || 0;

    return (
        <div className="col-md-6 mt-4">
            <div className="row d-flex">
                {/* Bagian Kiri: Average Rating */}
                <div className="col-md-5">
                    <div className="circle-survey">
                        <h2 style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            {averageRating}
                        </h2>

                        <ul className="stars" style={{ marginRight: '25pt' }}>
                            {renderStars(averageRating)}
                        </ul>

                        <p>
                            <span>{totalRatings.toLocaleString()}</span> Penilaian
                        </p>
                    </div>
                </div>

                <div className="col-sm-2"></div>

                {/* Bagian Kanan: Rating Distribution */}
                <div className="col-md-5 mt-4">
                    <div className="lap-row">
                        <h4 style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            {siteName}
                        </h4>
                    </div>

                    <h6 style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>Rating</h6>

                    <div className="progress-bar" style={{ backgroundColor: hasRatings ? '#ECF0F1' : 'transparent' }}>
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const distribution = stats?.ratingDistribution?.find(d => d.stars === rating);
                            const percentage = distribution?.percentage || 0;
                            const count = distribution?.count || 0;

                            return (
                                <div key={rating} className="list">
                                    <h6 style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                        {rating}
                                    </h6>
                                    <div className="progress">
                                        <div
                                            className={`progress-bar progress-bar-striped ${hasRatings ? 'bg-danger' : 'bg-secondary'
                                                }`}
                                            role="progressbar"
                                            style={{
                                                width: hasRatings ? `${percentage}%` : '0%',
                                                minWidth: '2px'
                                            }}
                                            aria-value-now={count}
                                            aria-value-min="0"
                                            aria-value-max={totalRatings}
                                        ></div>
                                    </div>
                                    {hasRatings && (
                                        <span className="rating-count">
                                            {count} ({percentage}%)
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingDisplay;