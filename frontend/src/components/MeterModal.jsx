import React, { useState, useEffect } from 'react';
import { X, Gauge, Building2, MapPin, Layers, Save, Loader, Activity } from 'lucide-react';
import api from '../utils/api';

const MeterModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
    const [buildings, setBuildings] = useState([]);
    const [loadingBuildings, setLoadingBuildings] = useState(false);
    const [formData, setFormData] = useState({
        meterId: '',
        building: '',
        type: 'sub',
        status: 'active',
        location: {
            floor: '',
            room: '',
            description: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchBuildings();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                meterId: initialData.meterId || '',
                building: initialData.building?._id || initialData.building || '',
                type: initialData.type || 'sub',
                status: initialData.status || 'active',
                location: {
                    floor: initialData.location?.floor || '',
                    room: initialData.location?.room || '',
                    description: initialData.location?.description || ''
                }
            });
        } else {
            setFormData({
                meterId: '',
                building: '',
                type: 'sub',
                status: 'active',
                location: {
                    floor: '',
                    room: '',
                    description: ''
                }
            });
        }
    }, [initialData, isOpen]);

    const fetchBuildings = async () => {
        try {
            setLoadingBuildings(true);
            const response = await api.get('/buildings');
            // The API returns { success: true, count: N, data: [...] }
            setBuildings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching buildings:', error);
        } finally {
            setLoadingBuildings(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const locationField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [locationField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-md)'
        }}>
            <div className="glass-card animate-fadeIn" style={{
                width: '100%',
                maxWidth: '600px',
                background: 'var(--color-bg-dark)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'var(--shadow-xl)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>
                        {initialData ? 'Edit Water Meter' : 'Add New Meter'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="meterId">Meter ID</label>
                            <div className="input-group">
                                <span className="input-icon"><Gauge size={16} /></span>
                                <input
                                    type="text"
                                    id="meterId"
                                    name="meterId"
                                    className="form-input"
                                    value={formData.meterId}
                                    onChange={handleChange}
                                    placeholder="e.g. M-001"
                                    required
                                    disabled={initialData} // Usually can't change ID
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="building">Building</label>
                            <div className="input-group">
                                <span className="input-icon"><Building2 size={16} /></span>
                                <select
                                    id="building"
                                    name="building"
                                    className="form-select"
                                    value={formData.building}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Building</option>
                                    {loadingBuildings ? (
                                        <option disabled>Loading...</option>
                                    ) : (
                                        buildings.map(b => (
                                            <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="type">Type</label>
                            <div className="input-group">
                                <span className="input-icon"><Layers size={16} /></span>
                                <select
                                    id="type"
                                    name="type"
                                    className="form-select"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="main">Main Meter</option>
                                    <option value="sub">Sub Meter</option>
                                    <option value="individual">Individual Meter</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="status">Status</label>
                            <div className="input-group">
                                <span className="input-icon"><Activity size={16} /></span>
                                <select
                                    id="status"
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="faulty">Faulty</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="location.floor">Floor</label>
                            <div className="input-group">
                                <span className="input-icon"><Layers size={16} /></span>
                                <input
                                    type="number"
                                    id="location.floor"
                                    name="location.floor"
                                    className="form-input"
                                    value={formData.location.floor}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="location.room">Room</label>
                            <div className="input-group">
                                <span className="input-icon"><MapPin size={16} /></span>
                                <input
                                    type="text"
                                    id="location.room"
                                    name="location.room"
                                    className="form-input"
                                    value={formData.location.room}
                                    onChange={handleChange}
                                    placeholder="e.g. 101"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="location.description">Location Description</label>
                        <textarea
                            id="location.description"
                            name="location.description"
                            className="form-input"
                            value={formData.location.description}
                            onChange={handleChange}
                            placeholder="Additional details about location..."
                            rows="3"
                        />
                    </div>

                    <div className="flex justify-end gap-md" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader className="animate-pulse" size={16} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {initialData ? 'Update Meter' : 'Create Meter'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MeterModal;
