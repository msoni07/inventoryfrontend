'use client';
import withAuth from '../../../components/Auth/withAuth';
import React, { useEffect, useState } from 'react';

function DashboardPage() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMedicines = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3000/api/inventory/medicines', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch medicines');
                const data = await res.json();
                setMedicines(data.medicines || data || []);
            } catch (err) {
                setError('Could not load medicines.');
            } finally {
                setLoading(false);
            }
        };
        fetchMedicines();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            {loading && <div>Loading medicines...</div>}
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {!loading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border-b">Name</th>
                                <th className="px-4 py-2 border-b">Manufacturer</th>
                                <th className="px-4 py-2 border-b">Batch #</th>
                                <th className="px-4 py-2 border-b">Expiry</th>
                                <th className="px-4 py-2 border-b">MRP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-4">No medicines found.</td></tr>
                            )}
                            {medicines.map((med: any) => (
                                <tr key={med._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border-b">{med.name}</td>
                                    <td className="px-4 py-2 border-b">{med.manufacturer}</td>
                                    <td className="px-4 py-2 border-b">{med.batchNumber}</td>
                                    <td className="px-4 py-2 border-b">{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : ''}</td>
                                    <td className="px-4 py-2 border-b">{med.mrp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default withAuth(DashboardPage); 