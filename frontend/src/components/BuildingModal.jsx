import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Users, Layers, Save, Loader } from 'lucide-react';

const BuildingModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'academic',
        floors: 1,
        capacity: 0,
        address: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                code: initialData.code || '',
                type: initialData.type || 'academic',
                floors: initialData.floors || 1,
                capacity: initialData.capacity || 0,
                address: initialData.location?.address || ''
            });
        } else {
            setFormData({
                name: '',
                code: '',
                type: 'academic',
                floors: 1,
                capacity: 0,
                address: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                maxWidth: '500px',
                background: 'var(--color-bg-dark)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'var(--shadow-xl)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>
                        {initialData ? 'Edit Building' : 'Add New Building'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Building Name</label>
                        <div className="input-group">
                            <span className="input-icon"><Building2 size={16} /></span>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Science Block A"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="code">Building Code</label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                className="form-input"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g. SCI-A"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="type">Type</label>
                            <select
                                id="type"
                                name="type"
                                className="form-select"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="academic">Academic</option>
                                <option value="residential">Residential</option>
                                <option value="administrative">Administrative</option>
                                <option value="recreational">Recreational</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="floors">Floors</label>
                            <div className="input-group">
                                <span className="input-icon"><Layers size={16} /></span>
                                <input
                                    type="number"
                                    id="floors"
                                    name="floors"
                                    className="form-input"
                                    value={formData.floors}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="capacity">Capacity</label>
                            <div className="input-group">
                                <span className="input-icon"><Users size={16} /></span>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    className="form-input"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="address">Address / Location</label>
                        <div className="input-group">
                            <span className="input-icon"><MapPin size={16} /></span>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                className="form-input"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Campus Area / Street"
                            />
                        </div>
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
                                    {initialData ? 'Update Building' : 'Create Building'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BuildingModal;
