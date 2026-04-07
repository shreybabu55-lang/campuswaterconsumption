import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, User, Reply } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../utils/api';
import { getCurrentUser } from '../utils/auth';

const Queries = () => {
    const user = getCurrentUser();
    const isAdmin = user?.role === 'admin';
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ subject: '', description: '' });
    const [responseForm, setResponseForm] = useState({ queryId: '', response: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const res = await api.get('/queries');
            setQueries(res.data.data);
        } catch (err) {
            console.error('Error fetching queries:', err);
            setError('Failed to load queries.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuerySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/queries', formData);
            setFormData({ subject: '', description: '' });
            fetchQueries();
        } catch (err) {
            setError('Failed to submit query.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdminResponse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/queries/${responseForm.queryId}`, { adminResponse: responseForm.response });
            setResponseForm({ queryId: '', response: '' });
            fetchQueries();
        } catch (err) {
            setError('Failed to send response.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)' }}>
            <Navbar />
            <div className="container">
                <div className="flex flex-col gap-xl">
                    <header>
                        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
                            {isAdmin ? 'Student Queries' : 'Support & Queries'}
                        </h1>
                        <p className="text-muted">
                            {isAdmin ? 'Manage and respond to student inquiries' : 'Report issues or ask questions about the water system'}
                        </p>
                    </header>

                    <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-2xl)' }}>
                        {/* Summary / Form Column */}
                        <div style={{ gridColumn: 'span 1' }}>
                            {!isAdmin ? (
                                <Card title="New Query">
                                    <form onSubmit={handleQuerySubmit} className="flex flex-col gap-md">
                                        <div className="form-group">
                                            <label className="form-label">Subject</label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g., Leakage in Block A"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-input"
                                                rows="5"
                                                placeholder="Describe your issue in detail..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                required
                                                style={{ resize: 'vertical' }}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                                            {submitting ? 'Sending...' : 'Submit Query'}
                                            <Send size={18} style={{ marginLeft: '8px' }} />
                                        </button>
                                    </form>
                                </Card>
                            ) : (
                                <div className="flex flex-col gap-md">
                                    <Card title="Query Overview">
                                        <div className="flex flex-col gap-md">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted">Total Queries</span>
                                                <span className="font-bold">{queries.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted">Pending</span>
                                                <span className="badge badge-warning">{queries.filter(q => q.status === 'pending').length}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted">Resolved</span>
                                                <span className="badge badge-success">{queries.filter(q => q.status === 'replied').length}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {error && (
                                <div className="badge badge-danger w-full mt-md" style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Queries List Column */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <div className="flex flex-col gap-lg">
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }} className="text-muted">Loading queries...</div>
                                ) : queries.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px' }} className="glass-card flex flex-col items-center">
                                        <MessageSquare size={48} className="text-muted mb-md" style={{ opacity: 0.2 }} />
                                        <p className="text-muted">No queries found.</p>
                                    </div>
                                ) : (
                                    queries.map((query) => (
                                        <div key={query._id} className="glass-card animate-fadeIn" style={{ padding: 'var(--spacing-xl)' }}>
                                            <div className="flex justify-between items-start mb-md">
                                                <div className="flex items-center gap-md">
                                                    <div style={{
                                                        padding: '10px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: 'var(--radius-lg)'
                                                    }}>
                                                        <MessageSquare size={20} className="text-primary-light" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{query.subject}</h3>
                                                        <div className="flex gap-md items-center text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                                                            <span className="flex items-center gap-xs"><Clock size={12} /> {new Date(query.createdAt).toLocaleString()}</span>
                                                            {isAdmin && <span className="flex items-center gap-xs"><User size={12} /> {query.student?.name || 'Unknown User'} ({query.student?.department || 'N/A'})</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`badge badge-${query.status === 'replied' ? 'success' : 'warning'}`}>
                                                    {query.status === 'replied' ? 'Resolved' : 'Pending'}
                                                </span>
                                            </div>

                                            <p className="text-secondary mb-xl" style={{ lineHeight: 1.6 }}>{query.description}</p>

                                            {query.adminResponse && (
                                                <div style={{
                                                    background: 'rgba(56, 189, 248, 0.05)',
                                                    borderLeft: '3px solid var(--color-secondary)',
                                                    padding: 'var(--spacing-lg)',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginTop: 'var(--spacing-md)'
                                                }}>
                                                    <div className="flex items-center gap-sm mb-xs" style={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                                        <Reply size={16} />
                                                        Administrator Response
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{query.adminResponse}</p>
                                                </div>
                                            )}

                                            {isAdmin && query.status === 'pending' && (
                                                <form onSubmit={handleAdminResponse} className="mt-xl">
                                                    <textarea
                                                        className="form-input mb-md"
                                                        rows="3"
                                                        placeholder="Write your response..."
                                                        value={responseForm.queryId === query._id ? responseForm.response : ''}
                                                        onChange={(e) => setResponseForm({ queryId: query._id, response: e.target.value })}
                                                        required
                                                    ></textarea>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (responseForm.queryId === query._id) handleAdminResponse({ preventDefault: () => { } });
                                                            else setResponseForm({ queryId: query._id, response: '' });
                                                        }}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={submitting}
                                                    >
                                                        {submitting ? 'Sending...' : 'Send Response'}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Queries;
