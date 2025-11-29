import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Shield,
    BarChart3,
    Settings,
    Zap
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/dashboard/users', icon: Users, label: 'Users' },
        { path: '/dashboard/wireguard', icon: Shield, label: 'WireGuard' },
        { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Zap size={28} />
                <span className="gradient-text">G-Radius</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <Link to="/" className="sidebar-item">
                    <span>← Back to Home</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
