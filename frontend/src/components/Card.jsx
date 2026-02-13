import React from 'react';

const Card = ({ children, title, actions, className = '', ...props }) => {
    return (
        <div className={`glass-card ${className}`} {...props}>
            {(title || actions) && (
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    {title && (
                        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                            {title}
                        </h3>
                    )}
                    {actions && (
                        <div className="flex gap-sm items-center">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
