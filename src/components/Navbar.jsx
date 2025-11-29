import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import Button from './Button';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isDashboard) return null;

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-logo">
                        <Zap size={28} />
                        <span className="gradient-text">G-Radius</span>
                    </Link>

                    <div className={`navbar-links ${isMobileMenuOpen ? 'navbar-links-open' : ''}`}>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#about">About</a>
                        <Link to="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="primary" size="sm">Get Started</Button>
                        </Link>
                    </div>

                    <button
                        className="navbar-mobile-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
