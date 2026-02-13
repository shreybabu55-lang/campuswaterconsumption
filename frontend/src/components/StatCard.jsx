import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const getGradient = () => {
        switch (color) {
            case 'success': return 'linear-gradient(135deg, hsl(142, 76%, 45%) 0%, hsl(162, 76%, 55%) 100%)';
            case 'warning': return 'linear-gradient(135deg, hsl(38, 92%, 50%) 0%, hsl(45, 92%, 60%) 100%)';
            case 'danger': return 'linear-gradient(135deg, hsl(0, 84%, 60%) 0%, hsl(10, 84%, 70%) 100%)';
            default: return 'var(--gradient-primary)';
        }
    };

    return (
        <div className="glass-card animate-fadeIn" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background Icon */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                opacity: 0.05,
                transform: 'rotate(15deg)'
            }}>
                <Icon size={120} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <p className="text-secondary" style={{
                            fontSize: 'var(--font-size-sm)',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            {title}
                        </p>
                        <h3 style={{
                            fontSize: 'var(--font-size-3xl)',
                            fontWeight: 700,
                            margin: 0,
                            background: getGradient(),
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {value}
                        </h3>
                    </div>
                    <div style={{
                        background: getGradient(),
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <Icon size={24} color="white" />
                    </div>
                </div>

                {trend && (
                    <div className="flex items-center gap-sm">
                        <span style={{
                            fontSize: 'var(--font-size-sm)',
                            color: trend === 'up' ? 'var(--color-success)' : 'var(--color-danger)',
                            fontWeight: 600
                        }}>
                            {trend === 'up' ? '↑' : '↓'} {trendValue}
                        </span>
                        <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                            vs last month
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
