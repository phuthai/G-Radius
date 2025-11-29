import React from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Shield, Users, BarChart3,
    Globe, Lock, Cpu, ArrowRight,
    Check, Star
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './LandingPage.css';

const LandingPage = () => {
    const features = [
        {
            icon: <Shield size={32} />,
            title: 'WireGuard Integration',
            description: 'Seamlessly manage WireGuard VPN alongside RADIUS authentication'
        },
        {
            icon: <Users size={32} />,
            title: 'User Management',
            description: 'Intuitive interface for managing users, groups, and permissions'
        },
        {
            icon: <BarChart3 size={32} />,
            title: 'Real-time Analytics',
            description: 'Monitor bandwidth, sessions, and user activity in real-time'
        },
        {
            icon: <Globe size={32} />,
            title: 'Multi-tenant Support',
            description: 'Manage multiple organizations from a single dashboard'
        },
        {
            icon: <Lock size={32} />,
            title: 'Enterprise Security',
            description: 'Bank-grade encryption and security compliance built-in'
        },
        {
            icon: <Cpu size={32} />,
            title: 'High Performance',
            description: 'Optimized for speed and scalability with modern architecture'
        }
    ];

    const pricingPlans = [
        {
            name: 'Starter',
            price: '$29',
            period: '/month',
            features: [
                'Up to 100 users',
                'Basic analytics',
                'Email support',
                '99.9% uptime SLA',
                'Community access'
            ],
            popular: false
        },
        {
            name: 'Professional',
            price: '$99',
            period: '/month',
            features: [
                'Up to 1,000 users',
                'Advanced analytics',
                'Priority support',
                '99.99% uptime SLA',
                'API access',
                'Custom integrations'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            features: [
                'Unlimited users',
                'Full analytics suite',
                '24/7 dedicated support',
                '99.999% uptime SLA',
                'White-label options',
                'On-premise deployment',
                'Custom development'
            ],
            popular: false
        }
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="container">
                    <div className="hero-content animate-fade-in-up">
                        <h1 className="hero-title">
                            Modern <span className="gradient-text">RADIUS</span> &
                            <span className="gradient-text"> WireGuard</span> Management
                        </h1>
                        <p className="hero-subtitle">
                            The most powerful, intuitive platform for managing network authentication
                            and VPN infrastructure. Built for the cloud era.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register">
                                <Button variant="primary" size="lg" icon={<Zap size={20} />}>
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="secondary" size="lg" icon={<ArrowRight size={20} />}>
                                    View Demo
                                </Button>
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <h3>10K+</h3>
                                <p>Active Users</p>
                            </div>
                            <div className="hero-stat">
                                <h3>99.99%</h3>
                                <p>Uptime</p>
                            </div>
                            <div className="hero-stat">
                                <h3>50M+</h3>
                                <p>Requests/Day</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section features">
                <div className="container">
                    <div className="section-header">
                        <h2 className="animate-fade-in">Powerful Features</h2>
                        <p className="animate-fade-in">Everything you need to manage your network infrastructure</p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <Card key={index} className="feature-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="section pricing">
                <div className="container">
                    <div className="section-header">
                        <h2 className="animate-fade-in">Simple, Transparent Pricing</h2>
                        <p className="animate-fade-in">Choose the plan that fits your needs</p>
                    </div>
                    <div className="pricing-grid">
                        {pricingPlans.map((plan, index) => (
                            <Card
                                key={index}
                                className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''} animate-fade-in-up`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {plan.popular && <div className="pricing-badge">Most Popular</div>}
                                <h3>{plan.name}</h3>
                                <div className="pricing-price">
                                    <span className="price">{plan.price}</span>
                                    <span className="period">{plan.period}</span>
                                </div>
                                <ul className="pricing-features">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <Check size={18} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register">
                                    <Button
                                        variant={plan.popular ? 'primary' : 'secondary'}
                                        fullWidth
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="animate-fade-in">Ready to Get Started?</h2>
                        <p className="animate-fade-in">Join thousands of companies using G-Radius to power their network infrastructure</p>
                        <Link to="/register">
                            <Button variant="primary" size="lg" icon={<Zap size={20} />}>
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
