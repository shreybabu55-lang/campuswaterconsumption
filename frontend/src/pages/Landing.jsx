import { Link } from 'react-router-dom';
import { setActivePortal } from '../utils/auth';
import { Droplets, Activity, Shield, Zap, ArrowRight, Gauge, BarChart3, Bell, GraduationCap, ShieldCheck } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-dark)',
            color: 'var(--color-text-primary)',
            overflowX: 'hidden',
            position: 'relative'
        }}>
            {/* Background Decorations */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(14, 116, 209, 0.15) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                bottom: '0',
                left: '-5%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Navbar Placeholder (Public) */}
            <nav style={{
                padding: 'var(--spacing-xl) 0',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="container flex justify-between items-center">
                    <div className="flex items-center gap-md">
                        <div style={{
                            background: 'var(--gradient-primary)',
                            padding: 'var(--spacing-sm)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-glow)'
                        }}>
                            <Droplets size={24} color="white" />
                        </div>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>
                            <span style={{
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                AquaTrack
                            </span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-md">
                        <Link to="/login" onClick={() => setActivePortal('student')} className="btn btn-secondary" style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <GraduationCap size={16} /> Student Login
                        </Link>
                        <Link to="/register" className="btn btn-primary" style={{ fontSize: 'var(--font-size-sm)' }}>
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                padding: 'var(--spacing-2xl) 0',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
            }}>
                <div className="container">
                    <div className="animate-fadeIn">
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: 'var(--spacing-lg)',
                            maxWidth: '900px',
                            margin: '0 auto var(--spacing-lg)'
                        }}>
                            Revolutionizing Campus <br />
                            <span style={{
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Water Management
                            </span>
                        </h1>
                        <p className="text-secondary" style={{
                            fontSize: 'var(--font-size-lg)',
                            maxWidth: '600px',
                            margin: '0 auto var(--spacing-xl)',
                            lineHeight: 1.6
                        }}>
                            Real-time monitoring, intelligent analytics, and precision conservation for modern educational institutions.
                        </p>

                        <div className="flex justify-center gap-md">
                            <button className="btn btn-primary btn-lg" onClick={() => {
                                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                            }}>
                                Explore Features
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Feature Cards Grid */}
            <section id="features" style={{ padding: 'var(--spacing-2xl) 0', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-xl)' }}>
                        <div className="glass-card flex flex-col items-center text-center">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(14, 116, 209, 0.1)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--color-primary-light)'
                            }}>
                                <Gauge size={32} />
                            </div>
                            <h3>Smart Metering</h3>
                            <p className="text-muted">High-precision tracking of water flow across every building on campus.</p>
                        </div>

                        <div className="glass-card flex flex-col items-center text-center">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(56, 189, 248, 0.1)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--color-secondary)'
                            }}>
                                <BarChart3 size={32} />
                            </div>
                            <h3>Deep Analytics</h3>
                            <p className="text-muted">Visualize consumption patterns and identify opportunities for optimization.</p>
                        </div>

                        <div className="glass-card flex flex-col items-center text-center">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--color-danger)'
                            }}>
                                <Bell size={32} />
                            </div>
                            <h3>Instant Alerts</h3>
                            <p className="text-muted">Real-time leak detection and threshold notifications to prevent waste.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA / Hidden Portal Notice */}
            <section style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-2xl)', textAlign: 'center' }}>
                <div className="container">
                    <div className="glass-card" style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        padding: 'var(--spacing-2xl)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Student Portal</h2>
                        <p className="text-secondary" style={{ marginBottom: 'var(--spacing-xl)' }}>
                            AquaTrack is available for registered students. Login or register to view water consumption data for your hostel.
                        </p>
                        <div className="flex justify-center gap-lg" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <Link to="/login" onClick={() => setActivePortal('student')} className="glass-card" style={{
                                padding: 'var(--spacing-lg) var(--spacing-2xl)',
                                textDecoration: 'none',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}>
                                <GraduationCap size={36} style={{ color: 'var(--color-primary-light)', marginBottom: '8px' }} />
                                <div style={{ fontWeight: 600, fontSize: '16px', color: 'white' }}>Student Login</div>
                                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>View your hostel water data</div>
                            </Link>
                            <Link to="/register" className="glass-card" style={{
                                padding: 'var(--spacing-lg) var(--spacing-2xl)',
                                textDecoration: 'none',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: '1px solid rgba(56, 189, 248, 0.2)'
                            }}>
                                <Shield size={36} style={{ color: 'var(--color-success)', marginBottom: '8px' }} />
                                <div style={{ fontWeight: 600, fontSize: '16px', color: 'white' }}>Register</div>
                                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Create your student account</div>
                            </Link>
                        </div>
                        <div className="flex justify-center gap-md items-center text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                            <Shield size={16} />
                            <span>Enterprise-grade security and encryption</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: 'var(--spacing-xl) 0',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: 'var(--spacing-2xl)'
            }}>
                <div className="container flex justify-between items-center text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                    <p>&copy; 2026 AquaTrack Systems. All rights reserved.</p>
                    <div className="flex gap-lg">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <Link to="/admin-portal" onClick={() => setActivePortal('admin')} style={{ color: 'inherit', textDecoration: 'none', opacity: 0.5 }}>Admin</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
