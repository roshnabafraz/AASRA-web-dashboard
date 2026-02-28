import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)', transition: 'var(--transition)' }}>
            <Sidebar />
            <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, padding: '2rem', transition: 'margin-left 0.3s' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
