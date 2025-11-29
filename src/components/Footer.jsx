import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="gradient-text">G-Radius</h3>
                        <p>Modern RADIUS and WireGuard management platform for the cloud era.</p>
                        <div className="footer-social">
                            <a href="#" aria-label="GitHub"><Github size={20} /></a>
                            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                            <a href="#" aria-label="Email"><Mail size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Product</h4>
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#docs">Documentation</a>
                        <a href="#api">API Reference</a>
                    </div>

                    <div className="footer-section">
                        <h4>Company</h4>
                        <a href="#about">About Us</a>
                        <a href="#blog">Blog</a>
                        <a href="#careers">Careers</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className="footer-section">
                        <h4>Legal</h4>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#security">Security</a>
                        <a href="#compliance">Compliance</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2025 G-Radius. All rights reserved.</p>
                    <p>Built with ❤️ for the modern web</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
