import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Mail, Lock, User, Loader, ShieldPlus, Building2 } from 'lucide-react';
import api from '../utils/api';
import { setToken, setUser, setActivePortal } from '../utils/auth';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        building: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);

    useEffect(() => {
        setActivePortal('student');
        const fetchBuildings = async () => {
            try {
                // Fetch all buildings for students to select from
                const response = await api.get('/buildings/list');
                setBuildings(response.data.data || []);
            } catch (err) {
                console.error('Error fetching buildings:', err);
            }
        };
        fetchBuildings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                building: formData.building || undefined // Only send if selected
            });

            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                setActivePortal('student');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Internal server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg-dark)',
            padding: 'var(--spacing-lg)',
            position: 'relative'
        }}>
            {/* Clean Background Glow */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(14, 116, 209, 0.05) 0%, transparent 70%)',
                zIndex: 0
            }} />

            <div className="glass-card animate-fadeIn" style={{
                maxWidth: '400px',
                width: '100%',
                position: 'relative',
                zIndex: 1,
                padding: 'var(--spacing-2xl)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div className="flex flex-col items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        background: 'var(--gradient-primary)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--spacing-md)',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <ShieldPlus size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, margin: 0 }}>
                        Create Account
                    </h1>
                    <p className="text-muted" style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: 'var(--font-size-xs)' }}>
                        Institutional Water Management System
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-danger)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: 'var(--font-size-xs)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Your full name"
                                style={{ paddingLeft: '40px' }}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }} />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@email.com"
                                style={{ paddingLeft: '40px' }}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
                        <label className="form-label">Hostel/Building</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }} />
                            <select
                                className="form-input"
                                style={{ paddingLeft: '40px', appearance: 'none' }}
                                value={formData.building}
                                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select your hostel</option>
                                {buildings.map(b => (
                                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-pulse" size={20} /> : 'Register Account'}
                    </button>
                </form>

                <div style={{
                    marginTop: 'var(--spacing-xl)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-xs)'
                }}>
                    Access requests are logged and monitored.
                </div>
            </div>
        </div>
    );
};

export default Register;
