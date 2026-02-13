import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Droplets, History, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const ReadingModal = ({ isOpen, onClose, meter, onSuccess }) => {
    const [reading, setReading] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setReading('');
            setNotes('');
            setError(null);
            setWarning(null);
        }
    }, [isOpen, meter]);

    const handleReadingChange = (e) => {
        const val = e.target.value;
        setReading(val);

        // Simple client-side validation/warning
        if (meter?.lastReading?.value && val < meter.lastReading.value) {
            setWarning('New reading is lower than previous reading. This might indicate a meter rollover or error.');
        } else {
            setWarning(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reading) return;

        try {
            setLoading(true);
            setError(null);

            await api.post('/readings', {
                meter: meter._id,
                reading: Number(reading),
                notes
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error submitting reading:', err);
            setError(err.response?.data?.message || 'Failed to submit reading');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !meter) return null;

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
                boxShadow: 'var(--shadow-xl)'
            }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Droplets size={24} className="text-primary" />
                        Record Reading
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Meter ID</div>
                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{meter.meterId}</div>
                        {meter.building && (
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                {meter.building.name} • {meter.location?.room || meter.location?.floor ? `Floor ${meter.location?.floor || '-'}, Room ${meter.location?.room || '-'}` : 'No location info'}
                            </div>
                        )}
                    </div>

                    {meter.lastReading && (
                        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <History size={16} className="text-primary" />
                            <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Previous: </span>
                                <strong style={{ color: 'white' }}>{meter.lastReading.value?.toLocaleString()} L</strong>
                                <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                                    ({new Date(meter.lastReading.timestamp).toLocaleDateString()})
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-danger)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            gap: 'var(--spacing-sm)',
                            alignItems: 'center'
                        }}>
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="reading">Current Reading (Liters)</label>
                        <div className="input-group">
                            <span className="input-icon"><Droplets size={16} /></span>
                            <input
                                type="number"
                                id="reading"
                                name="reading"
                                className="form-input"
                                value={reading}
                                onChange={handleReadingChange}
                                placeholder="Enter current meter value"
                                required
                                min="0"
                                step="any"
                                autoFocus
                            />
                        </div>
                        {warning && (
                            <div style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={12} />
                                {warning}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="notes">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            name="notes"
                            className="form-input"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any observations, e.g., 'Minor leak detected'"
                            rows="2"
                        />
                    </div>

                    <div className="flex justify-end gap-md" style={{ marginTop: 'var(--spacing-xl)' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-pulse" size={16} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Submit Reading
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReadingModal;
