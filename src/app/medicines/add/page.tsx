'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { addMedicine, getMedicineDetails, updateMedicine } from '@/services/inventoryService'; // Import service functions
import withAuthGuard from '@/Auth/withAuthGuard'; // Apply the auth guard
import toast from 'react-hot-toast'; // Import toast
import { Button } from '@/components/ui/button'; // Import Button component

// Define the shape of the form data
interface AddMedicineFormData {
    name: string;
    manufacturer: string;
    saltComposition: string;
    batchNumber: string;
    expiryDate: string; // Input type date gives YYYY-MM-DD
    mrp: number | ''; // Use string for input and convert to number
    purchasePrice: number | '';
    quantityInStock: number | '';
    hsnCode: string;
    gstPercentage: number | '';
    scheduleType: string;
    barcode: string;
}

const initialFormData: AddMedicineFormData = {
    name: '',
    manufacturer: '',
    saltComposition: '',
    batchNumber: '',
    expiryDate: '',
    mrp: '',
    purchasePrice: '',
    quantityInStock: '',
    hsnCode: '',
    gstPercentage: '',
    scheduleType: '',
    barcode: '',
};

function AddMedicinePage() {
    const [formData, setFormData] = useState<AddMedicineFormData>(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for validation errors
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams();
    const medicineId = params.id as string | undefined;

    // Add a ref to track the first render
    const effectRan = useRef(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Clear the specific error when the user types
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        // Basic required field validation
        Object.keys(formData).forEach(key => {
            // Skip validation for the commented-out supplier field
            // if (key === 'supplier') {
            //     return;
            // }
            if (formData[key as keyof AddMedicineFormData] === '' || formData[key as keyof AddMedicineFormData] === null || formData[key as keyof AddMedicineFormData] === undefined) {
                // Exclude fields that are numbers but not required to be non-zero initially if they are empty strings
                if (typeof initialFormData[key as keyof AddMedicineFormData] !== 'number' || formData[key as keyof AddMedicineFormData] !== '') {
                    newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
                }
            }
        });

        // Add other specific validations here if needed (e.g., number ranges, date validity)

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fetch medicine data if in edit mode
    useEffect(() => {
        // Use the ref to prevent the first fetch on initial mount in Strict Mode
        if (!effectRan.current) {
            effectRan.current = true;
            // Skip fetch on the very first render (the first of the two runs in Strict Mode)
            return;
        }

        if (medicineId) {
            setLoading(true);
            const fetchDetails = async () => {
                try {
                    const data = await getMedicineDetails(medicineId);
                    // Map fetched data to form state, handling potential nulls/undefineds
                    setFormData({
                        name: data.name || '',
                        manufacturer: data.manufacturer || '',
                        saltComposition: data.saltComposition || '',
                        batchNumber: data.batchNumber || '',
                        // Format date to YYYY-MM-DD for input type="date"
                        expiryDate: data.expiryDate ? data.expiryDate.split('T')[0] : '',
                        mrp: data.mrp !== undefined && data.mrp !== null ? data.mrp : '',
                        purchasePrice: data.purchasePrice !== undefined && data.purchasePrice !== null ? data.purchasePrice : '',
                        quantityInStock: data.quantityInStock !== undefined && data.quantityInStock !== null ? data.quantityInStock : '',
                        hsnCode: data.hsnCode || '',
                        gstPercentage: data.gstPercentage !== undefined && data.gstPercentage !== null ? data.gstPercentage : '',
                        scheduleType: data.scheduleType || '',
                        barcode: data.barcode || '',
                    });
                } catch (err: any) {
                    toast.error(err.message || 'Failed to fetch medicine details.');
                    // Optionally redirect if medicine not found
                    // router.push('/medicines');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [medicineId]); // Dependency array includes medicineId

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        setLoading(true);

        // Convert numeric fields from string to number
        const dataToSubmit = {
            ...formData,
            mrp: parseFloat(formData.mrp as string) || 0, // Convert to number, default to 0 if empty or invalid
            purchasePrice: parseFloat(formData.purchasePrice as string) || 0,
            quantityInStock: parseInt(formData.quantityInStock as string, 10) || 0,
            gstPercentage: parseFloat(formData.gstPercentage as string) || 0,
            // Note: expiryDate from input type='date' is YYYY-MM-DD. 
            // You might need to convert it to ISO string 'YYYY-MM-DDTHH:mm:ss.sssZ' if your API expects that format with time.
            // For simplicity, we'll pass YYYY-MM-DD for now. Adjust if API requires time.
            expiryDate: formData.expiryDate,
        };

        try {
            if (medicineId) {
                // Update existing medicine
                await updateMedicine(medicineId, dataToSubmit as any); // Pass ID and data
                toast.success('Medicine updated successfully!');
            } else {
                // Add new medicine
                await addMedicine(dataToSubmit as any); // Cast to any
                toast.success('Medicine added successfully!');
                setFormData(initialFormData); // Clear form only on add success
            }
            setFormData(initialFormData); // Clear form
            router.push('/medicines'); // Go back to list
        } catch (err: any) {
            console.error(`Error ${medicineId ? 'updating' : 'adding'} medicine:`, err);
            toast.error(err.message || `Failed to ${medicineId ? 'update' : 'add'} medicine.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">{medicineId ? 'Update Medicine' : 'Add New Medicine'}</h1>
                    <Button variant="outline" onClick={() => router.back()}>Back</Button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                    </div>

                    <div>
                        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                        <input type="text" id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                    </div>

                    <div>
                        <label htmlFor="saltComposition" className="block text-sm font-medium text-gray-700 mb-1">Salt Composition</label>
                        <input type="text" id="saltComposition" name="saltComposition" value={formData.saltComposition} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                    </div>

                    <div>
                        <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                        <input type="text" id="batchNumber" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                    </div>

                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                    </div>

                    <div>
                        <label htmlFor="mrp" className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                        <input type="number" id="mrp" name="mrp" value={formData.mrp} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" step="0.01" />
                    </div>

                    <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                        <input type="number" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" step="0.01" />
                    </div>

                    <div>
                        <label htmlFor="quantityInStock" className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                        <input type="number" id="quantityInStock" name="quantityInStock" value={formData.quantityInStock} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" step="1" />
                    </div>

                    <div>
                        <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                        <input type="text" id="hsnCode" name="hsnCode" value={formData.hsnCode} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                    </div>

                    <div>
                        <label htmlFor="gstPercentage" className="block text-sm font-medium text-gray-700 mb-1">GST Percentage</label>
                        <input type="number" id="gstPercentage" name="gstPercentage" value={formData.gstPercentage} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" step="0.01" />
                    </div>

                    <div>
                        <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                        <select id="scheduleType" name="scheduleType" value={formData.scheduleType} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2">
                            <option value="">Select Schedule Type</option>
                            <option value="Generic">Generic</option>
                            <option value="Schedule H">Schedule H</option>
                            <option value="Schedule H1">Schedule H1</option>
                            <option value="Schedule X">Schedule X</option>
                            <option value="OTC">OTC</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                        <input type="text" id="barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border border-gray-200 shadow focus:border-blue-500 focus:ring-blue-500 p-2" />
                        {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
                        <Button type="button" variant="outline" onClick={() => router.push('/medicines')} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
                            {loading ? (medicineId ? 'Updating...' : 'Adding...') : (medicineId ? 'Update Medicine' : 'Add Medicine')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default withAuthGuard(AddMedicinePage); 