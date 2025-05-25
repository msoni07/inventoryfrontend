'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { getMedicineDetails } from '@/services/inventoryService'; // We will create this function
import type { Medicine } from '@/app/medicines/page'; // Reuse the Medicine interface
import withAuthGuard from '@/Auth/withAuthGuard'; // Apply the auth guard
import toast from 'react-hot-toast'; // Import toast
import { Button } from '@/components/ui/button'; // Import Button component

function MedicineDetailsPage() {
    const params = useParams();
    const medicineId = params.medicineId as string; // Get the medicine ID from the URL

    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter(); // Initialize useRouter

    // Use a ref to track if the effect has run its initial pass
    const effectRan = useRef(false);

    useEffect(() => {
        const fetchMedicine = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMedicineDetails(medicineId);
                setMedicine(data);
            } catch (err: any) {
                console.error('Error fetching medicine details:', err);
                toast.error(err.message || 'Failed to fetch medicine details.'); // Display error toast
                // Redirect to /medicines if the API call fails
                router.push('/medicines');
                // Optionally set error state if you still want to log/see it before redirect
                // setError(err.message || 'Failed to fetch medicine details.');
            } finally {
                setLoading(false);
            }
        };

        // Prevent fetching on the very first render (part of Strict Mode double render)
        if (!effectRan.current) {
            effectRan.current = true;
            return; // Skip the fetch on the first run
        }

        if (medicineId) {
            fetchMedicine();
        }
    }, [medicineId, router]); // Add router to dependencies

    if (loading) {
        return <div className="p-6">Loading medicine details...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>;
    }

    if (!medicine) {
        return <div className="p-6">Medicine not found.</div>;
    }

    // Basic display of medicine details
    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{medicine.name}</h1>
                <Button variant="outline" onClick={() => router.back()}>Back</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Manufacturer:</strong> {medicine.manufacturer}</div>
                <div><strong>Salt Composition:</strong> {medicine.saltComposition}</div>
                <div><strong>Batch Number:</strong> {medicine.batchNumber}</div>
                <div><strong>Expiry Date:</strong> {new Date(medicine.expiryDate).toLocaleDateString()}</div>
                <div><strong>MRP:</strong> {medicine.mrp}</div>
                <div><strong>Purchase Price:</strong> {medicine.purchasePrice}</div>
                <div><strong>Quantity in Stock:</strong> {medicine.quantityInStock}</div>
                <div><strong>HSN Code:</strong> {medicine.hsnCode}</div>
                <div><strong>GST Percentage:</strong> {medicine.gstPercentage}%</div>
                <div><strong>Schedule Type:</strong> {medicine.scheduleType}</div>
                <div><strong>Barcode:</strong> {medicine.barcode}</div>
            </div>
            {/* You can add more details here as needed */}
        </div>
    );
}

export default withAuthGuard(MedicineDetailsPage); // Apply the auth guard 