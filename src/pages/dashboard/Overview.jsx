import React from 'react';
import { Users, Activity, TrendingUp, Database } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import Card from '../../components/Card';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Overview = () => {
    const stats = [
        {
            icon: <Users size={24} />,
            label: 'Total Users',
            value: '2,543',
            change: '+12.5%',
            positive: true
        },
        {
            icon: <Activity size={24} />,
            label: 'Active Sessions',
            value: '1,234',
            change: '+8.2%',
            positive: true
        },
        {
            icon: <TrendingUp size={24} />,
            label: 'Bandwidth Used',
            value: '847 GB',
            change: '+23.1%',
            positive: true
        },
        {
            icon: <Database size={24} />,
            label: 'Server Load',
            value: '67%',
            change: '-5.4%',
            positive: false
        }
    ];

    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Bandwidth (GB)',
                data: [650, 590, 800, 810, 760, 850, 847],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const doughnutData = {
        labels: ['Active', 'Inactive', 'Suspended'],
        datasets: [
            {
                data: [1234, 987, 322],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 0
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#cbd5e1'
                }
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

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#cbd5e1',
                    padding: 20
                }
            }
        }
    };

    const recentActivity = [
        { user: 'john@example.com', action: 'Logged in', time: '2 minutes ago' },
        { user: 'sarah@example.com', action: 'Created VPN config', time: '15 minutes ago' },
        { user: 'mike@example.com', action: 'Updated profile', time: '1 hour ago' },
        { user: 'emma@example.com', action: 'Logged out', time: '2 hours ago' },
        { user: 'david@example.com', action: 'Changed password', time: '3 hours ago' }
    ];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back! Here's what's happening with your network.</p>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <Card key={index} className="stat-card">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <p className="stat-label">{stat.label}</p>
                            <h3 className="stat-value">{stat.value}</h3>
                            <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="charts-grid">
                <Card className="chart-card">
                    <h3>Bandwidth Usage</h3>
                    <div className="chart-container">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </Card>

                <Card className="chart-card">
                    <h3>User Status Distribution</h3>
                    <div className="chart-container">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </Card>
            </div>

            <Card className="activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-info">
                                <span className="activity-user">{activity.user}</span>
                                <span className="activity-action">{activity.action}</span>
                            </div>
                            <span className="activity-time">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Overview;
