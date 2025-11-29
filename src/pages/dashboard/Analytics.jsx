import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Download, Calendar } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './Dashboard.css';

const Analytics = () => {
    const bandwidthData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Upload (GB)',
                data: [45, 52, 48, 65, 72, 58, 63],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Download (GB)',
                data: [120, 135, 128, 145, 152, 138, 143],
                borderColor: 'rgb(236, 72, 153)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const userActivityData = {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [
            {
                label: 'Active Users',
                data: [120, 80, 250, 450, 520, 380, 200],
                backgroundColor: 'rgba(20, 184, 166, 0.8)',
                borderRadius: 8
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#cbd5e1' }
            }
        },
        scales: {
            y: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            x: {
                ticks: { color: '#94a3b8' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            }
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Detailed insights into your network performance</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <Button variant="secondary" icon={<Calendar size={20} />}>
                        Last 7 Days
                    </Button>
                    <Button variant="primary" icon={<Download size={20} />}>
                        Export Report
                    </Button>
                </div>
            </div>

            <Card className="chart-card">
                <h3>Bandwidth Usage Trends</h3>
                <div className="chart-container" style={{ height: '350px' }}>
                    <Line data={bandwidthData} options={chartOptions} />
                </div>
            </Card>

            <Card className="chart-card">
                <h3>User Activity by Hour</h3>
                <div className="chart-container" style={{ height: '350px' }}>
                    <Bar data={userActivityData} options={chartOptions} />
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
