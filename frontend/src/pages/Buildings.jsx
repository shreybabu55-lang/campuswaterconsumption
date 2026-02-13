import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Users, Gauge, Pencil, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import BuildingModal from '../components/BuildingModal';
import api from '../utils/api';
import { isAdmin } from '../utils/auth';

const Buildings = () => {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBuilding, setCurrentBuilding] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const response = await api.get('/buildings');
            setBuildings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching buildings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            setActionLoading(true);
            await api.post('/buildings', {
                ...formData,
                location: { address: formData.address }
            });
            await fetchBuildings();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating building:', error);
            alert(error.response?.data?.message || 'Failed to create building');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            setActionLoading(true);
            await api.put(`/buildings/${currentBuilding._id}`, {
                ...formData,
                location: { address: formData.address }
            });
            await fetchBuildings();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating building:', error);
            alert(error.response?.data?.message || 'Failed to update building');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this building?')) return;

        try {
            setActionLoading(true);
            await api.delete(`/buildings/${id}`);
            await fetchBuildings();
        } catch (error) {
            console.error('Error deleting building:', error);
            alert(error.response?.data?.message || 'Failed to delete building');
        } finally {
            setActionLoading(false);
        }
    };

    const openCreateModal = () => {
        setCurrentBuilding(null);
        setIsModalOpen(true);
    };

    const openEditModal = (building) => {
        setCurrentBuilding(building);
        setIsModalOpen(true);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'academic': return 'primary';
            case 'residential': return 'success';
            case 'administrative': return 'warning';
            case 'recreational': return 'info';
            default: return 'secondary';
        }
    };

    const getTypeBadgeClass = (type) => {
        switch (type) {
            case 'academic': return 'badge-info';
            case 'residential': return 'badge-success';
            case 'administrative': return 'badge-warning';
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
                            Buildings
                        </h1>
                        <p className="text-secondary" style={{ margin: 0 }}>
                            Manage campus buildings and their water infrastructure
                        </p>
                    </div>
                    {isAdmin() && (
                        <button className="btn btn-primary" onClick={openCreateModal}>
                            <Plus size={20} />
                            Add Building
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="animate-pulse">Loading buildings...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3">
                        {buildings.map((building) => (
                            <Card key={building._id} className="animate-fadeIn">
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        <div>
                                            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0, marginBottom: 'var(--spacing-xs)' }}>
                                                {building.name}
                                            </h3>
                                            <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                                <Building2 size={14} />
                                                <span>{building.code}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-sm items-center">
                                            <span className={`badge ${getTypeBadgeClass(building.type)}`}>
                                                {building.type}
                                            </span>
                                            {isAdmin() && (
                                                <div className="flex gap-xs">
                                                    <button
                                                        onClick={() => openEditModal(building)}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ padding: '4px', color: 'var(--color-primary-light)' }}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(building._id)}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ padding: '4px', color: 'var(--color-danger)' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {building.location?.address && (
                                        <div className="flex items-center gap-sm" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                            <MapPin size={14} />
                                            <span>{building.location.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                            Floors
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                            {building.floors}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                            Capacity
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                            <Users size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                            {building.capacity || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: 'var(--spacing-md)',
                                    padding: 'var(--spacing-sm)',
                                    background: 'var(--gradient-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center',
                                    color: 'white'
                                }}>
                                    <Gauge size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                    <strong>{building.meterCount || 0}</strong> Active Meters
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {!loading && buildings.length === 0 && (
                    <Card>
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                            <Building2 size={64} style={{ opacity: 0.2, marginBottom: 'var(--spacing-md)' }} />
                            <h3 style={{ color: 'var(--color-text-secondary)' }}>No buildings found</h3>
                            <p className="text-muted">Start by adding your first building</p>
                        </div>
                    </Card>
                )}

                <BuildingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={currentBuilding ? handleUpdate : handleCreate}
                    initialData={currentBuilding}
                    isLoading={actionLoading}
                />
            </div>
        </div>
    );
};

export default Buildings;
