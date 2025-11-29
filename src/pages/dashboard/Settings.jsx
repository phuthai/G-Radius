import React, { useState } from 'react';
import { Save, Bell, Lock, Globe } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './Dashboard.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        siteName: 'G-Radius',
        siteUrl: 'https://gradius.example.com',
        adminEmail: 'admin@example.com',
        twoFactor: true,
        emailNotifications: true,
        sessionTimeout: '30'
    });
    const [googleAuth, setGoogleAuth] = useState({
        enabled: false,
        client_id: '',
        client_secret: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'security', label: 'Security', icon: <Lock size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'google', label: 'Google OAuth', icon: <Globe size={18} /> }
    ];

    useEffect(() => {
        // Fetch Google Auth settings
        const fetchSettings = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/settings/google-auth');
                if (response.ok) {
                    const data = await response.json();
                    if (data.settings) {
                        setGoogleAuth({
                            enabled: data.settings.enabled === 1,
                            client_id: data.settings.client_id || '',
                            client_secret: data.settings.client_secret || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load settings', err);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveGoogleAuth = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await fetch('http://localhost:5000/api/settings/google-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleAuth)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error saving settings' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your application preferences</p>
                </div>
                <Button variant="primary" icon={<Save size={20} />} onClick={() => activeTab === 'google' ? handleSaveGoogleAuth() : null}>
                    Save Changes
                </Button>
            </div>

            <div className="settings-container">
                <Card className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </Card>

                <Card className="settings-content">
                    {message && (
                        <div className={`alert alert-${message.type}`} style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="settings-section">
                            <h3>General Settings</h3>
                            <Input
                                label="Site Name"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                            <Input
                                label="Site URL"
                                value={settings.siteUrl}
                                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                            />
                            <Input
                                label="Admin Email"
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                            />
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-section">
                            <h3>Security Settings</h3>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.twoFactor}
                                    onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
                                />
                                <span>Enable Two-Factor Authentication</span>
                            </label>
                            <Input
                                label="Session Timeout (minutes)"
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                            />
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notification Preferences</h3>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                />
                                <span>Email Notifications</span>
                            </label>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-md)' }}>
                                Receive email notifications for important events and updates
                            </p>
                        </div>
                    )}

                    {activeTab === 'google' && (
                        <div className="settings-section">
                            <h3>Google OAuth Configuration</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                                Configure Google OAuth to allow users to sign in with their Google accounts.
                            </p>

                            <label className="checkbox-label" style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={googleAuth.enabled}
                                    onChange={(e) => setGoogleAuth({ ...googleAuth, enabled: e.target.checked })}
                                />
                                <span>Enable Google Authentication</span>
                            </label>

                            <Input
                                label="Client ID"
                                value={googleAuth.client_id}
                                onChange={(e) => setGoogleAuth({ ...googleAuth, client_id: e.target.value })}
                                placeholder="Enter Google Client ID"
                            />

                            <Input
                                label="Client Secret"
                                type="password"
                                value={googleAuth.client_secret}
                                onChange={(e) => setGoogleAuth({ ...googleAuth, client_secret: e.target.value })}
                                placeholder={googleAuth.client_secret === '********' ? '********' : "Enter Google Client Secret"}
                            />

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Callback URL</label>
                                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                    http://10.0.0.3:5000/api/auth/google/callback
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                    Add this URL to your Google Cloud Console "Authorized redirect URIs"
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Settings;
