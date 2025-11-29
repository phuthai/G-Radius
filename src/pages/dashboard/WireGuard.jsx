import React from 'react';
import { Shield, Plus, Download, QrCode, Activity } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Dashboard.css';

const WireGuard = () => {
    const peers = [
        { id: 1, name: 'Office VPN', publicKey: 'abc123...xyz789', endpoint: '192.168.1.1:51820', status: 'connected', traffic: '1.2 GB' },
        { id: 2, name: 'Mobile Device', publicKey: 'def456...uvw012', endpoint: '192.168.1.2:51820', status: 'connected', traffic: '450 MB' },
        { id: 3, name: 'Remote Worker', publicKey: 'ghi789...rst345', endpoint: '192.168.1.3:51820', status: 'disconnected', traffic: '0 MB' },
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>WireGuard Management</h1>
                    <p>Configure and monitor WireGuard VPN connections</p>
                </div>
                <Button variant="primary" icon={<Plus size={20} />}>
                    Add Peer
                </Button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <Card className="stat-card">
                    <div className="stat-icon"><Shield size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Active Peers</p>
                        <h3 className="stat-value">2</h3>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon"><Activity size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Total Traffic</p>
                        <h3 className="stat-value">1.65 GB</h3>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon"><Shield size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Server Status</p>
                        <h3 className="stat-value">Online</h3>
                    </div>
                </Card>
            </div>

            <Card>
                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Connected Peers</h3>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Public Key</th>
                                <th>Endpoint</th>
                                <th>Status</th>
                                <th>Traffic</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {peers.map(peer => (
                                <tr key={peer.id}>
                                    <td className="user-name">{peer.name}</td>
                                    <td><code className="code-snippet">{peer.publicKey}</code></td>
                                    <td>{peer.endpoint}</td>
                                    <td>
                                        <span className={`status-badge status-${peer.status === 'connected' ? 'active' : 'inactive'}`}>
                                            {peer.status}
                                        </span>
                                    </td>
                                    <td>{peer.traffic}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="action-btn"><QrCode size={16} /></button>
                                            <button className="action-btn"><Download size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default WireGuard;
