import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Mail, Lock, Loader, GraduationCap, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { setToken, setUser, setActivePortal } from '../utils/auth';

const UserLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [isResetMode, setIsResetMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setActivePortal('student');
    }, []);

    const performLogin = async (email, password) => {
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                if (response.data.user.role === 'admin') {
                    setError('Use the Administrative Portal for admin access.');
                    setLoading(false);
                    return;
                }

                setToken(response.data.token);
                setUser(response.data.user);
                setActivePortal('student');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const performReset = async (email, password) => {
        setError('');
        setResetSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', { email, newPassword: password });
            if (response.data.success) {
                setResetSuccess(response.data.message || 'Password reset successfully.');
                setIsResetMode(false);
                setFormData({ email: '', password: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isResetMode) {
            await performReset(formData.email, formData.password);
        } else {
            await performLogin(formData.email, formData.password);
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
                background: 'radial-gradient(circle at center, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
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
                        <Droplets size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, margin: 0 }}>
                        {isResetMode ? 'Reset Password' : 'Login'}
                    </h1>
                    <p className="text-muted" style={{ margin: 'var(--spacing-xs) 0 0 0', fontSize: 'var(--font-size-xs)' }}>
                        Institutional Water Management System
                    </p>
                </div>

                {resetSuccess && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-success, #10b981)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: 'var(--font-size-xs)',
                        textAlign: 'center'
                    }}>
                        {resetSuccess}
                    </div>
                )}

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
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>{isResetMode ? 'New Password' : 'Password'}</label>
                            {!isResetMode && (
                                <a href="#" onClick={(e) => { e.preventDefault(); setIsResetMode(true); setError(''); setResetSuccess(''); }} style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>Forgot Password?</a>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)'
                            }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)',
                                    display: 'flex'
                                }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                        disabled={loading}
                    >
                        {loading ? <Loader className="animate-pulse" size={20} /> : (isResetMode ? 'Reset Password' : 'Login to Dashboard')}
                    </button>
                    {isResetMode && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsResetMode(false); setError(''); setResetSuccess(''); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--font-size-sm)' }}>Back to Login</a>
                        </div>
                    )}
                </form>

                    {!isResetMode && (
                        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                            <span className="text-muted">Don't have an account? </span>
                            <Link to="/register" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>
                                Register here
                            </Link>
                        </div>
                    )}

                <div style={{
                    marginTop: 'var(--spacing-xl)',
                    paddingTop: 'var(--spacing-lg)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-xs)'
                }}>
                    <ShieldCheck size={14} />
                    <span>Authorized Institutional Access Only</span>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
