import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Heart, Users, UserX, Info, LogOut, Sun, Moon, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
        { name: 'Donations', path: '/donations', icon: <Heart size={20} /> },
        { name: 'Volunteers', path: '/volunteers', icon: <Users size={20} /> },
        { name: 'Victims', path: '/victims', icon: <UserX size={20} /> },
        { name: 'Broadcast', path: '/broadcast', icon: <Radio size={20} /> },
        { name: 'About', path: '/about', icon: <Info size={20} /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/aasra_logo.svg" alt="AASRA Logo" style={{ width: '40px', height: '40px' }} />
                <h2 className="logo" style={{ margin: 0 }}>AASRA</h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button className="logout-btn" onClick={logout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
