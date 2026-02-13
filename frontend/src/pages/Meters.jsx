import React, { useState, useEffect } from 'react';
import { Gauge, Plus, Building2, Activity, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import MeterModal from '../components/MeterModal';
import ReadingModal from '../components/ReadingModal';
import api from '../utils/api';
import { isAdmin, isStaff } from '../utils/auth';

const Meters = () => {
    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMeter, setCurrentMeter] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Reading modal state
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [readingMeter, setReadingMeter] = useState(null);

    useEffect(() => {
        fetchMeters();
    }, []);

    const fetchMeters = async () => {
        try {
            const response = await api.get('/meters');
            setMeters(response.data.data || []);
        } catch (error) {
            console.error('Error fetching meters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            setActionLoading(true);
            await api.post('/meters', formData);
            await fetchMeters();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating meter:', error);
            alert(error.response?.data?.message || 'Failed to create meter');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            setActionLoading(true);
            await api.put(`/meters/${currentMeter._id}`, formData);
            await fetchMeters();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating meter:', error);
            alert(error.response?.data?.message || 'Failed to update meter');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meter?')) return;

        try {
            setActionLoading(true);
            await api.delete(`/meters/${id}`);
            await fetchMeters();
        } catch (error) {
            console.error('Error deleting meter:', error);
            alert(error.response?.data?.message || 'Failed to delete meter');
        } finally {
            setActionLoading(false);
        }
    };

    const openCreateModal = () => {
        setCurrentMeter(null);
        setIsModalOpen(true);
    };

    const openEditModal = (meter) => {
        setCurrentMeter(meter);
        setIsModalOpen(true);
    };

    const openReadingModal = (meter) => {
        setReadingMeter(meter);
        setIsReadingModalOpen(true);
    };

    const handleReadingSuccess = () => {
        fetchMeters(); // Refresh to show new last reading
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'secondary';
            case 'maintenance': return 'warning';
            case 'faulty': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'active': return 'badge-success';
            case 'inactive': return 'badge-info';
            case 'maintenance': return 'badge-warning';
            case 'faulty': return 'badge-danger';
            default: return 'badge-info';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                            Water Meters
                        </h1>
                        <p className="text-secondary" style={{ margin: 0 }}>
                            Monitor and manage water meters across campus
                        </p>
                    </div>
                    {isAdmin() && (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            <Plus size={20} />
                            Add Meter
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="animate-pulse">Loading meters...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3">
                        {meters.map((meter) => (
                            <Card key={meter._id} className="animate-fadeIn">
                                <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div>
                                        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                                            {meter.meterId}
                                        </h3>
                                        {meter.building && (
                                            <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                <Building2 size={14} />
                                                <span>{meter.building.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center" style={{ marginTop: 'var(--spacing-md)' }}>
                                        <span className={`badge ${getStatusBadgeClass(meter.status || 'default')}`} style={{ textTransform: 'capitalize' }}>
                                            {meter.status || 'Unknown'}
                                        </span>
                                        <div className="flex gap-xs">
                                            {(isAdmin() || (isStaff && isStaff())) && (
                                                <button
                                                    onClick={() => openReadingModal(meter)}
                                                    className="btn btn-primary btn-sm"
                                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                                    title="Record new reading"
                                                >
                                                    <Gauge size={14} style={{ marginRight: '4px' }} />
                                                    Record
                                                </button>
                                            )}
                                            {(isAdmin() || (isStaff && isStaff())) && (
                                                <button
                                                    onClick={() => openEditModal(meter)}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ padding: '4px', color: 'var(--color-primary-light)' }}
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                            {isAdmin() && (
                                                <button
                                                    onClick={() => handleDelete(meter._id)}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ padding: '4px', color: 'var(--color-danger)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {meter.location && (
                                    <div style={{
                                        padding: 'var(--spacing-sm)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: 'var(--spacing-md)'
                                    }}>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                            Location
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                            {meter.location.floor && `Floor ${meter.location.floor}`}
                                            {meter.location.room && `, Room ${meter.location.room}`}
                                            {meter.location.description && ` - ${meter.location.description}`}
                                        </div>
                                    </div>
                                )}

                                {meter.lastReading && (
                                    <div style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--gradient-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'white'
                                    }}>
                                        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9, marginBottom: '4px' }}>
                                            Last Reading
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: '4px' }}>
                                            {meter.lastReading.value?.toLocaleString()} L
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                                            {new Date(meter.lastReading.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {!meter.lastReading && (
                                    <div style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'rgba(251, 146, 60, 0.1)',
                                        border: '1px solid rgba(251, 146, 60, 0.3)',
                                        borderRadius: 'var(--radius-md)',
                                        textAlign: 'center'
                                    }}>
                                        <AlertCircle size={24} style={{ color: 'var(--color-warning)', marginBottom: 'var(--spacing-xs)' }} />
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-warning)' }}>
                                            No readings recorded
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    padding: 'var(--spacing-sm)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    textAlign: 'center'
                                }}>
                                    Type: <strong style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{meter.type}</strong> • Installed: {new Date(meter.installDate).toLocaleDateString()}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {(!loading && meters.length === 0) && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <Gauge size={64} style={{ opacity: 0.2, marginBottom: 'var(--spacing-md)' }} />
                            <h3 style={{ color: 'var(--color-text-secondary)' }}>No meters found</h3>
                            <p className="text-muted">Start by adding your first water meter</p>
                        </div>
                    </Card>
                )}

                <MeterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={currentMeter ? handleUpdate : handleCreate}
                    initialData={currentMeter}
                    isLoading={actionLoading}
                />

                <ReadingModal
                    isOpen={isReadingModalOpen}
                    onClose={() => setIsReadingModalOpen(false)}
                    meter={readingMeter}
                    onSuccess={handleReadingSuccess}
                />
            </div>
        </div>
    );
};

export default Meters;
