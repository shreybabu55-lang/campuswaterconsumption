import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, Loader, ArrowRight, User } from 'lucide-react';
import api from '../utils/api';
import { setToken, setUser } from '../utils/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const performLogin = async (email, password) => {
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await performLogin(formData.email, formData.password);
    };

    const handleDemoLogin = (role) => {
        const credentials = {
            admin: { email: 'admin@campus.edu', password: 'password123' },
            staff: { email: 'staff@campus.edu', password: 'password123' },
            student: { email: 'student@campus.edu', password: 'password123' }
        };
        const active = credentials[role];
        setFormData(active);
        performLogin(active.email, active.password);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gradient-overlay), var(--color-bg-dark)',
            padding: 'var(--spacing-lg)'
        }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%' }}>
                {/* Logo */}
                <div className="flex flex-col items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        background: 'var(--gradient-primary)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--radius-xl)',
                        marginBottom: 'var(--spacing-md)',
                        boxShadow: 'var(--shadow-glow)'
                    }}>
                        <Droplets size={48} color="white" />
                    </div>
                    <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, margin: 0 }}>
                        <span style={{
                            background: 'var(--gradient-primary)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            AquaTrack
                        </span>
                    </h1>
                    <p className="text-secondary" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                        Campus Water Management System
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-danger)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="your.email@campus.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="animate-pulse" size={20} />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Sign Up <ArrowRight size={14} />
                        </Link>
                    </p>
                </div>

                {/* Demo Login Buttons */}
                <div style={{ marginTop: 'var(--spacing-xl)' }}>
                    <div style={{
                        position: 'relative',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-md)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)'
                    }}>
                        <span style={{ background: 'var(--color-bg-dark)', padding: '0 10px', position: 'relative', zIndex: 1 }}>
                            Quick Login (Demo)
                        </span>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            zIndex: 0
                        }}></div>
                    </div>

                    <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-sm)' }}>
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('admin')}
                            className="btn"
                            disabled={loading}
                            style={{
                                background: 'rgba(147, 51, 234, 0.1)',
                                border: '1px solid rgba(147, 51, 234, 0.3)',
                                color: '#d8b4fe',
                                fontSize: 'var(--font-size-xs)',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Lock size={16} />
                            Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('staff')}
                            className="btn"
                            disabled={loading}
                            style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#93c5fd',
                                fontSize: 'var(--font-size-xs)',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <User size={16} />
                            Staff
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('student')}
                            className="btn"
                            disabled={loading}
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#6ee7b7',
                                fontSize: 'var(--font-size-xs)',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <User size={16} />
                            Student
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
