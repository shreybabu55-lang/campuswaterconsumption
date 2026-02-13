import React from 'react';
import { useState, useEffect } from 'react';
import { Droplets, Building2, Gauge, Bell, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import api from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalConsumption: 0,
        activeMeters: 0,
        activeAlerts: 0,
        buildings: 0
    });
    const [recentReadings, setRecentReadings] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [buildingsRes, metersRes, readingsRes, alertsRes, statsRes] = await Promise.all([
                api.get('/buildings'),
                api.get('/meters'),
                api.get('/readings?limit=20'),
                api.get('/alerts?status=active'),
                api.get('/readings/stats')
            ]);

            setStats({
                totalConsumption: Math.round(statsRes.data.data?.totalConsumption || 0),
                activeMeters: metersRes.data.data?.filter(m => m.status === 'active').length || 0,
                activeAlerts: alertsRes.data.count || 0,
                buildings: buildingsRes.data.count || 0
            });

            // Format readings for chart
            const chartData = readingsRes.data.data?.slice(0, 10).reverse().map((reading, idx) => ({
                time: new Date(reading.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                consumption: reading.consumption || 0
            })) || [];
            setRecentReadings(chartData);

            setAlerts(alertsRes.data.data?.slice(0, 5) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'info';
            default: return 'success';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
                {/* Stats Grid */}
                <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <StatCard
                        title="Total Consumption"
                        value={`${stats.totalConsumption.toLocaleString()}L`}
                        icon={Droplets}
                        trend="up"
                        trendValue="12.5%"
                        color="primary"
                    />
                    <StatCard
                        title="Active Meters"
                        value={stats.activeMeters}
                        icon={Gauge}
                        trend="up"
                        trendValue="5"
                        color="success"
                    />
                    <StatCard
                        title="Buildings"
                        value={stats.buildings}
                        icon={Building2}
                        color="info"
                    />
                    <StatCard
                        title="Active Alerts"
                        value={stats.activeAlerts}
                        icon={Bell}
                        trend="down"
                        trendValue="3"
                        color={stats.activeAlerts > 0 ? 'danger' : 'success'}
                    />
                </div>

                <div className="grid grid-cols-3">
                    {/* Consumption Chart */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <Card title="Recent Water Consumption" actions={
                            <div className="badge badge-info">Last 10 Readings</div>
                        }>
                            {recentReadings.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={recentReadings}>
                                        <defs>
                                            <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(200, 95%, 45%)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(200, 95%, 45%)" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="time" stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                                        <YAxis stroke="var(--color-text-muted)" style={{ fontSize: '12px' }} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'var(--color-bg-dark-card)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 'var(--radius-md)',
                                                color: 'var(--color-text-primary)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="consumption"
                                            stroke="hsl(200, 95%, 45%)"
                                            strokeWidth={3}
                                            fill="url(#colorConsumption)"
                                            dot={{ fill: 'hsl(200, 95%, 45%)', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                                    No consumption data available
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Recent Alerts */}
                    <div>
                        <Card title="Active Alerts">
                            {alerts.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {alerts.map((alert) => (
                                        <div
                                            key={alert._id}
                                            style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderLeft: `3px solid var(--color-${getSeverityColor(alert.severity)})`,
                                                borderRadius: 'var(--radius-sm)',
                                                transition: 'all var(--transition-fast)'
                                            }}
                                        >
                                            <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                <span className={`badge badge-${getSeverityColor(alert.severity)}`} style={{ fontSize: '10px' }}>
                                                    {alert.severity}
                                                </span>
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                    {new Date(alert.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 style={{ fontSize: 'var(--font-size-sm)', margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                                                {alert.title}
                                            </h4>
                                            {alert.description && (
                                                <p style={{ fontSize: 'var(--font-size-xs)', margin: 0, color: 'var(--color-text-secondary)' }}>
                                                    {alert.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>
                                    <Bell size={48} style={{ opacity: 0.2, marginBottom: 'var(--spacing-sm)' }} />
                                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>No active alerts</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
