import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, TrendingUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../utils/api';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('week');
    const [consumptionData, setConsumptionData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Paginated readings state
    const [readings, setReadings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalReadings, setTotalReadings] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    useEffect(() => {
        fetchReadings();
    }, [currentPage, pageSize]);

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
                api.get(`/readings?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=500`),
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
            })).slice(-14);

            if (chartData.length === 0) {
                 const mockWeekly = [
                    { day: 'Mon', consumption: 820 },
                    { day: 'Tue', consumption: 600 },
                    { day: 'Wed', consumption: 710 },
                    { day: 'Thu', consumption: 920 },
                    { day: 'Fri', consumption: 540 },
                    { day: 'Sat', consumption: 290 },
                    { day: 'Sun', consumption: 450 }
                ];
                setConsumptionData(timeRange === 'week' ? mockWeekly : mockWeekly.map(d => ({...d, consumption: d.consumption * 4})));
                if (!statsRes.data.data || !statsRes.data.data.totalConsumption) {
                    setStats({
                        totalConsumption: 4330,
                        avgConsumption: 618,
                        maxConsumption: 920,
                        readingCount: 7
                    });
                }
            } else {
                setConsumptionData(chartData);
                setStats(statsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReadings = async () => {
        setTableLoading(true);
        try {
            const res = await api.get(`/readings?page=${currentPage}&limit=${pageSize}`);
            setReadings(res.data.data || []);
            setTotalPages(res.data.pages || 0);
            setTotalReadings(res.data.total || 0);
        } catch (error) {
            console.error('Error fetching paginated readings:', error);
        } finally {
            setTableLoading(false);
        }
    };

    const paginationBtnStyle = (disabled) => ({
        padding: '6px 12px',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 'var(--radius-sm)',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
        color: disabled ? 'rgba(255,255,255,0.3)' : 'var(--color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        transition: 'all 0.15s ease'
    });

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
                                    {totalReadings || stats.readingCount || 0}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Consumption Chart */}
                <Card title="Water Consumption Trend" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    {consumptionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={consumptionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="day" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(34, 211, 238, 0.05)' }}
                                    contentStyle={{
                                        background: 'rgba(15, 23, 42, 0.8)',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(34, 211, 238, 0.4)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 8px 32px rgba(34, 211, 238, 0.2)'
                                    }}
                                    itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                                />
                                <Bar 
                                    dataKey="consumption" 
                                    fill="#22d3ee" 
                                    radius={[0, 0, 0, 0]} 
                                    barSize={40}
                                    minPointSize={5}
                                    animationDuration={2000}
                                    animationEasing="ease-out"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                            No consumption data available for selected period
                        </div>
                    )}
                </Card>

                {/* All Readings Table with Pagination */}
                <Card title="All Water Readings" actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                            {totalReadings} total records
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                            style={{
                                padding: '4px 8px',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#e2e8f0',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '13px'
                            }}
                        >
                            <option value={10} style={{ color: '#111' }}>10 / page</option>
                            <option value={25} style={{ color: '#111' }}>25 / page</option>
                            <option value={50} style={{ color: '#111' }}>50 / page</option>
                            <option value={100} style={{ color: '#111' }}>100 / page</option>
                        </select>
                    </div>
                }>
                    {tableLoading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                            Loading readings...
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meter ID</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Building</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reading (L)</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consumption (L)</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {readings.map((reading, idx) => (
                                            <tr key={reading._id} style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                transition: 'background 0.15s ease'
                                            }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '10px 16px', color: 'var(--color-text-muted)' }}>
                                                    {(currentPage - 1) * pageSize + idx + 1}
                                                </td>
                                                <td style={{ padding: '10px 16px', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                                                    {reading.meter?.meterId || 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)' }}>
                                                    {reading.meter?.building?.name || 'N/A'}
                                                </td>
                                                <td style={{ padding: '10px 16px', textAlign: 'right', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                                    {reading.reading?.toLocaleString() || '0'}
                                                </td>
                                                <td style={{
                                                    padding: '10px 16px',
                                                    textAlign: 'right',
                                                    fontWeight: 600,
                                                    color: reading.consumption > 5000 ? 'var(--color-danger)' : reading.consumption > 2000 ? 'var(--color-warning)' : 'var(--color-success)'
                                                }}>
                                                    {reading.consumption?.toLocaleString() || '0'}
                                                </td>
                                                <td style={{ padding: '10px 16px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                                    {new Date(reading.timestamp).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                    {reading.isAnomaly ? (
                                                        <span className="badge badge-danger" style={{ fontSize: '11px' }}>Anomaly</span>
                                                    ) : (
                                                        <span className="badge badge-success" style={{ fontSize: '11px' }}>Normal</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 'var(--spacing-lg)',
                                paddingTop: 'var(--spacing-md)',
                                borderTop: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalReadings)} of {totalReadings}
                                </span>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        style={paginationBtnStyle(currentPage === 1)}
                                    >
                                        <ChevronsLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={paginationBtnStyle(currentPage === 1)}
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>

                                    {/* Page numbers */}
                                    {(() => {
                                        const pages = [];
                                        let start = Math.max(1, currentPage - 2);
                                        let end = Math.min(totalPages, currentPage + 2);
                                        if (start > 1) pages.push(<span key="start-ellipsis" style={{ color: 'var(--color-text-muted)', padding: '0 4px' }}>...</span>);
                                        for (let i = start; i <= end; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        border: i === currentPage ? '1px solid hsl(200, 95%, 45%)' : '1px solid rgba(255,255,255,0.15)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        background: i === currentPage ? 'rgba(14, 116, 209, 0.2)' : 'rgba(255,255,255,0.05)',
                                                        color: i === currentPage ? 'hsl(200, 95%, 55%)' : 'var(--color-text-secondary)',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: i === currentPage ? 700 : 400,
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }
                                        if (end < totalPages) pages.push(<span key="end-ellipsis" style={{ color: 'var(--color-text-muted)', padding: '0 4px' }}>...</span>);
                                        return pages;
                                    })()}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        style={paginationBtnStyle(currentPage === totalPages)}
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        style={paginationBtnStyle(currentPage === totalPages)}
                                    >
                                        <ChevronsRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
