import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, User, Loader, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { setToken, setUser } from '../utils/auth';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                password: formData.password
            });

            if (response.data.success) {
                setToken(response.data.token);
                setUser(response.data.user);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        Create your account
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

                {/* Register Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

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
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">
                            <Lock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            minLength={6}
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
                                Creating Account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Sign In <ArrowRight size={14} />
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
