import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { UrlApi } from './apiUrl';

interface RatingFormProps {
    sessionId: string;
    pageUrl: string;
    onSuccess?: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({
    sessionId,
    onSuccess
}) => {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [suggestion, setSuggestion] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [charCount, setCharCount] = useState<number>(0);

    // Cek apakah sudah submit rating hari ini
    useEffect(() => {
        const today = new Date().toDateString();
        const submittedToday = localStorage.getItem(`rating_submitted_${sessionId}_${today}`);
        if (submittedToday) {
            setHasSubmitted(true);
        }
    }, [sessionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi
        if (rating === 0) {
            toast.error('Silakan berikan rating dengan bintang');
            return;
        }

        if (suggestion.trim().length < 10) {
            toast.error('Saran minimal 10 karakter');
            return;
        }

        if (email && !validateEmail(email)) {
            toast.error('Format email tidak valid');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${UrlApi}/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    email: email.trim() || null,
                    name: name.trim() || null,
                    rating,
                    suggestion: suggestion.trim(),             
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Simpan di localStorage untuk cegah spam
                const today = new Date().toDateString();
                localStorage.setItem(`rating_submitted_${sessionId}_${today}`, 'true');

                setHasSubmitted(true);
                toast.success('Terima kasih atas rating dan saran Anda!');

                // Reset form
                setRating(0);
                setName('');
                setEmail('');
                setSuggestion('');

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(data.error || 'Gagal mengirim rating');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Terjadi kesalahan, silakan coba lagi');
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Jika sudah submit hari ini
    if (hasSubmitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-green-600 text-5xl mb-4">✨</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Terima Kasih!
                </h3>
                <p className="text-green-700">
                    Anda sudah memberikan rating hari ini. Silakan kembali besok untuk memberikan rating lagi.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <Toaster position="top-right" />

            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Beri Rating & Saran</h2>
                <p className="text-gray-600 mt-2">
                    Bagikan pengalaman Anda untuk membantu kami menjadi lebih baik
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Stars */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Berapa bintang untuk website kami? *
                    </label>
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-4xl focus:outline-none transition-transform hover:scale-110"
                            >
                                <span className={`${star <= (hoverRating || rating)
                                    ? 'text-yellow-500'
                                    : 'text-gray-300'
                                    }`}>
                                    ★
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-sm text-gray-600">
                            {rating === 0 ? 'Pilih rating' : `${rating} Bintang`}
                            {rating > 0 && (
                                <span className="ml-2 text-yellow-600">
                                    {rating === 1 && 'Sangat Buruk'}
                                    {rating === 2 && 'Buruk'}
                                    {rating === 3 && 'Cukup'}
                                    {rating === 4 && 'Baik'}
                                    {rating === 5 && 'Sangat Baik'}
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama (opsional)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Masukkan nama Anda"
                        maxLength={50}
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (opsional)
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="email@contoh.com"
                    />
                    {email && !validateEmail(email) && (
                        <p className="mt-1 text-sm text-red-600">Format email tidak valid</p>
                    )}
                </div>

                {/* Suggestion Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saran/Kritik/Masukan *
                    </label>
                    <textarea
                        value={suggestion}
                        onChange={(e) => {
                            setSuggestion(e.target.value);
                            setCharCount(e.target.value.length);
                        }}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                        placeholder="Bagaimana pengalaman Anda? Apa yang bisa kami perbaiki? Minimal 10 karakter."
                        maxLength={500}
                        required
                    />
                    <div className="flex justify-between mt-1">
                        <span className={`text-sm ${charCount < 10 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                            Minimal 10 karakter
                        </span>
                        <span className="text-sm text-gray-500">
                            {charCount}/500
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || suggestion.length < 10}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition ${isSubmitting || rating === 0 || suggestion.length < 10
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                            Mengirim...
                        </div>
                    ) : (
                        'Kirim Rating & Saran'
                    )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                    * Rating dan saran Anda akan membantu kami meningkatkan kualitas layanan
                </p>
            </form>
        </div>
    );
};

export default RatingForm;