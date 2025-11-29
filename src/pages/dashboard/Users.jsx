import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './Dashboard.css';

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/radius/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.users || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>RADIUS Users</h1>
                    <p>Manage users in the RADIUS database</p>
                </div>
                <Button variant="outline" onClick={fetchUsers} icon={<RefreshCw size={20} />}>
                    Refresh
                </Button>
            </div>

            <Card className="users-card">
                <div className="users-controls">
                    <Input
                        placeholder="Search username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={<Search size={20} />}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Attribute</th>
                                <th>Operator</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center">No users found</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td className="font-medium">{user.username}</td>
                                        <td>{user.attribute}</td>
                                        <td>{user.op}</td>
                                        <td>{user.value}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Users;
