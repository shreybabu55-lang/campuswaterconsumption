import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../utils/api';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('week');
    const [consumptionData, setConsumptionData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const endDate = new Date();
            const startDate = new Date();

            switch (timeRange) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
            }

            const [readingsRes, statsRes] = await Promise.all([
                api.get(`/readings?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=50`),
                api.get(`/readings/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
            ]);

            // Aggregate by day
            const readingsByDay = {};
            readingsRes.data.data.forEach(reading => {
                const day = new Date(reading.timestamp).toLocaleDateString();
                if (!readingsByDay[day]) {
                    readingsByDay[day] = 0;
                }
                readingsByDay[day] += reading.consumption || 0;
            });

            const chartData = Object.entries(readingsByDay).map(([day, consumption]) => ({
                day,
                consumption: Math.round(consumption)
            })).slice(-14); // Last 14 days

            setConsumptionData(chartData);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                            Analytics
                        </h1>
                        <p className="text-secondary" style={{ margin: 0 }}>
                            Detailed insights into water consumption patterns
                        </p>
                    </div>
                    <div className="flex gap-sm items-center">
                        <div className="flex gap-sm" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {['week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={timeRange === range ? 'btn-primary' : 'btn-secondary'}
                                    style={{
                                        padding: 'var(--spacing-xs) var(--spacing-md)',
                                        fontSize: 'var(--font-size-sm)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        textTransform: 'capitalize',
                                        cursor: 'pointer',
                                        background: timeRange === range ? 'var(--gradient-primary)' : 'transparent',
                                        color: timeRange === range ? 'white' : 'var(--color-text-secondary)'
                                    }}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button className="btn btn-secondary">
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                {stats && (
                    <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <Card>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                    Total Consumption
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-3xl)',
                                    fontWeight: 700,
                                    background: 'var(--gradient-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {Math.round(stats.totalConsumption || 0).toLocaleString()} L
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                    Average Daily
                                </div>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-success)' }}>
                                    {Math.round(stats.avgConsumption || 0).toLocaleString()} L
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                    Peak Usage
                                </div>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-warning)' }}>
                                    {Math.round(stats.maxConsumption || 0).toLocaleString()} L
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                    Total Readings
                                </div>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-info)' }}>
                                    {stats.readingCount || 0}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Consumption Chart */}
                <Card title="Water Consumption Trend">
                    {consumptionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={consumptionData}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(200, 95%, 45%)" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="hsl(200, 95%, 45%)" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="day" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-dark-card)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)'
                                    }}
                                />
                                <Bar dataKey="consumption" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                            No consumption data available for selected period
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
