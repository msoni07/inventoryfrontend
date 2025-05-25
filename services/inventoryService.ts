import { api } from './authService'; // Assuming the configured axios instance is exported as 'api'

interface Medicine {
  _id: string;
  name: string;
  manufacturer: string;
  saltComposition: string;
  batchNumber: string;
  expiryDate: string; // Or Date if you parse it
  mrp: number;
  purchasePrice: number;
  quantityInStock: number;
  hsnCode: string;
  gstPercentage: number;
  scheduleType: string;
  barcode: string;
  lastUpdatedBy?: { _id: string; username: string; email: string }; // Optional
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  __v: number;
}

interface GetMedicinesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface GetMedicinesResponse {
  medicines: Medicine[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export const getMedicines = async (params: GetMedicinesParams): Promise<GetMedicinesResponse> => {
  try {
    const response = await api.get<GetMedicinesResponse>('/inventory/medicines', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching medicines:', error);
    throw error; // Re-throw the error for the component to handle
  }
}; 