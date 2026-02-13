import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, LayoutDashboard, Building2, Gauge, BarChart3, Bell, LogOut, User } from 'lucide-react';
import { getUser, logout } from '../utils/auth';

const Navbar = () => {
    const location = useLocation();
    const user = getUser();

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/buildings', label: 'Buildings', icon: Building2 },
        { path: '/meters', label: 'Meters', icon: Gauge },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/alerts', label: 'Alerts', icon: Bell },
    ];

    return (
        <nav className="glass-card" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            marginBottom: 'var(--spacing-xl)'
        }}>
            <div className="container">
                <div className="flex justify-between items-center" style={{ padding: 'var(--spacing-md) 0' }}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-md" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'var(--gradient-primary)',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Droplets size={24} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', margin: 0, fontWeight: 700 }}>
                                <span style={{
                                    background: 'var(--gradient-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    AquaTrack
                                </span>
                            </h2>
                            <p style={{ fontSize: 'var(--font-size-xs)', margin: 0, color: 'var(--color-text-muted)' }}>
                                Campus Water Management
                            </p>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex gap-sm items-center">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex items-center gap-sm"
                                    style={{
                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                        borderRadius: 'var(--radius-md)',
                                        background: isActive ? 'var(--gradient-primary)' : 'transparent',
                                        color: isActive ? 'white' : 'var(--color-text-secondary)',
                                        textDecoration: 'none',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 500,
                                        transition: 'all var(--transition-fast)',
                                        border: isActive ? 'none' : '1px solid transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Icon size={18} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-md">
                        <div className="flex items-center gap-sm" style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <User size={18} />
                            <div>
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                                    {user?.name || 'User'}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                    {user?.role || 'Student'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-secondary btn-sm"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
