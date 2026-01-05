import React, { useEffect, useState } from 'react';

interface SimpleStats {
    today: number;
    month: number;
    year: number;
    total: number;
}

const SimpleVisitorStats: React.FC = () => {
    const [stats, setStats] = useState<SimpleStats>({
        today: 0,
        month: 0,
        year: 0,
        total: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/stats/summary2');
                const data = await response.json();
                setStats({
                    today: data.today,
                    month: data.month,
                    year: data.year,
                    total: data.total
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-2">
            <div className="text-center mb-2">
                <h1 className="text-2xl font-bold text-gray-100">📊 Statistik Pengunjung</h1>
                {/* <p className="text-gray-300">Data diperbarui secara real-time</p> */}
            </div>

            <div className="grid grid-cols-1">
                <StatCard
                    title="Hari Ini"
                    value={stats.today}
                    color="blue"
                    icon="🕐"
                />

                <StatCard
                    title="Bulan Ini"
                    value={stats.month}
                    color="green"
                    icon="📅"
                />

                <StatCard
                    title="Tahun Ini"
                    value={stats.year}
                    color="purple"
                    icon="📈"
                />

                <StatCard
                    title="Total"
                    value={stats.total}
                    color="orange"
                    icon="👥"
                />
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    icon: string;
}> = ({ title, value, color, icon }) =>
    (<div className='flex flex-row justify-between'>
        <div className='flex flex-row gap-2'>
            <p className="text-sm font-medium text-gray-100">{title}</p>
        </div>
        <div className='flex flex-row gap-2'>
            <p className="text-white">:</p>
            <p className="text-lg font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-gray-100 mt-0.5">Pengunjung</p>
        </div>
    </div>
    );


export default SimpleVisitorStats;