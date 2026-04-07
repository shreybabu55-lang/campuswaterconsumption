import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentToken } from './utils/auth';

// Pages
import Landing from './pages/Landing';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Meters from './pages/Meters';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Queries from './pages/Queries';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    return !!getCurrentToken() ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    !!getCurrentToken() ? <Navigate to="/dashboard" /> : <Landing />
                } />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/admin-portal" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/buildings"
                    element={
                        <ProtectedRoute>
                            <Buildings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/meters"
                    element={
                        <ProtectedRoute>
                            <Meters />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute>
                            <Analytics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <Alerts />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/queries"
                    element={
                        <ProtectedRoute>
                            <Queries />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
