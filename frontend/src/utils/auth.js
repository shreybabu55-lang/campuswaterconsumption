// Determing which portal is active (Tab-specific)
export const getActivePortal = () => sessionStorage.getItem('active_portal') || 'student';
export const setActivePortal = (portal) => sessionStorage.setItem('active_portal', portal);

// --- Student auth ---
export const getToken = () => localStorage.getItem('student_token');
export const setToken = (token) => localStorage.setItem('student_token', token);
export const removeToken = () => localStorage.removeItem('student_token');

export const getUser = () => {
    const user = localStorage.getItem('student_user');
    return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem('student_user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('student_user');

// --- Admin auth ---
export const getAdminToken = () => localStorage.getItem('admin_token');
export const setAdminToken = (token) => localStorage.setItem('admin_token', token);
export const removeAdminToken = () => localStorage.removeItem('admin_token');

export const getAdminUser = () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
};
export const setAdminUser = (user) => localStorage.setItem('admin_user', JSON.stringify(user));
export const removeAdminUser = () => localStorage.removeItem('admin_user');

// --- Combined helpers ---
export const isAuthenticated = () => {
    return !!getToken() || !!getAdminToken();
};

export const isStudentAuthenticated = () => !!getToken();
export const isAdminAuthenticated = () => !!getAdminToken();

export const getCurrentUser = () => {
    return getActivePortal() === 'admin' ? getAdminUser() : getUser();
};

export const getCurrentToken = () => {
    return getActivePortal() === 'admin' ? getAdminToken() : getToken();
};

export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};

export const isAdmin = () => hasRole('admin');
export const isStaff = () => hasRole('staff');

export const logout = (navigate) => {
    removeToken();
    removeUser();
    if (navigate) {
        navigate('/login');
    } else {
        window.location.href = '/login';
    }
};

export const adminLogout = (navigate) => {
    removeAdminToken();
    removeAdminUser();
    if (navigate) {
        navigate('/admin-portal');
    } else {
        window.location.href = '/admin-portal';
    }
};
