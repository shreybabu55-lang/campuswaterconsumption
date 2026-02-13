import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../utils/api';
import { isAdmin, isStaff } from '../utils/auth';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, [filter]);

    const fetchAlerts = async () => {
        try {
            const params = filter === 'all' ? {} : { status: filter };
            const response = await api.get('/alerts', { params });
            setAlerts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (alertId) => {
        if (!isAdmin() && !isStaff()) return;

        try {
            await api.put(`/alerts/${alertId}`, { status: 'acknowledged' });
            fetchAlerts();
        } catch (error) {
            console.error('Error acknowledging alert:', error);
        }
    };

    const handleResolve = async (alertId) => {
        if (!isAdmin() && !isStaff()) return;

        try {
            await api.put(`/alerts/${alertId}`, { status: 'resolved' });
            fetchAlerts();
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return AlertCircle;
            case 'high': return AlertTriangle;
            case 'medium': return Bell;
            default: return Bell;
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

    const getSeverityBadgeClass = (severity) => {
        switch (severity) {
            case 'critical': return 'badge-danger';
            case 'high': return 'badge-warning';
            case 'medium': return 'badge-info';
            default: return 'badge-success';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                            Alerts
                        </h1>
                        <p className="text-secondary" style={{ margin: 0 }}>
                            Monitor and manage system alerts and notifications
                        </p>
                    </div>
                    <div className="flex gap-sm" style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '4px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {['all', 'active', 'acknowledged', 'resolved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                style={{
                                    padding: 'var(--spacing-xs) var(--spacing-md)',
                                    fontSize: 'var(--font-size-sm)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    background: filter === status ? 'var(--gradient-primary)' : 'transparent',
                                    color: filter === status ? 'white' : 'var(--color-text-secondary)',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="animate-pulse">Loading alerts...</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {alerts.map((alert) => {
                            const SeverityIcon = getSeverityIcon(alert.severity);
                            const severityColor = getSeverityColor(alert.severity);

                            return (
                                <Card key={alert._id} className="animate-fadeIn" style={{
                                    borderLeft: `4px solid var(--color-${severityColor})`
                                }}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-md" style={{ flex: 1 }}>
                                            <div style={{
                                                background: `rgba(${severityColor === 'danger' ? '239, 68, 68' : severityColor === 'warning' ? '251, 146, 60' : '14, 165, 233'}, 0.1)`,
                                                padding: 'var(--spacing-md)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: 'fit-content'
                                            }}>
                                                <SeverityIcon size={24} color={`var(--color-${severityColor})`} />
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                                    <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                                                        {alert.severity}
                                                    </span>
                                                    <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                                        {alert.type.replace('_', ' ')}
                                                    </span>
                                                    {alert.status === 'resolved' && (
                                                        <span className="badge badge-success">
                                                            <CheckCircle size={12} style={{ marginRight: '4px' }} />
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                                                    {alert.title}
                                                </h3>

                                                {alert.description && (
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                                                        {alert.description}
                                                    </p>
                                                )}

                                                <div className="flex gap-md" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                    <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                                                    {alert.acknowledgedAt && (
                                                        <span>• Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</span>
                                                    )}
                                                    {alert.resolvedAt && (
                                                        <span>• Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {(isAdmin() || isStaff()) && alert.status === 'active' && (
                                            <div className="flex gap-sm">
                                                <button
                                                    onClick={() => handleAcknowledge(alert._id)}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    <CheckCircle size={16} />
                                                    Acknowledge
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(alert._id)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <XCircle size={16} />
                                                    Resolve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {!loading && alerts.length === 0 && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <Bell size={64} style={{ opacity: 0.2, marginBottom: 'var(--spacing-md)' }} />
                            <h3 style={{ color: 'var(--color-text-secondary)' }}>No alerts found</h3>
                            <p className="text-muted">
                                {filter === 'all' ? 'System is running smoothly with no alerts' : `No ${filter} alerts`}
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Alerts;
