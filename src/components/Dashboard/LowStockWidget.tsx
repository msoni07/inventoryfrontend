'use client';

import { PackageWarning } from 'lucide-react';

export default function LowStockWidget() {
  // Mock Data
  const lowStockCount = 5;
  // Example of more detailed mock data that could be used:
  // const mockLowStockItems = [
  //   { id: 1, name: 'Amoxicillin 250mg', stock: 5, category: 'Antibiotics' },
  //   { id: 2, name: 'Saline Solution 500ml', stock: 3, category: 'IV Fluids' },
  //   { id: 3, name: 'Gauze Pads (Sterile)', stock: 8, category: 'Supplies' },
  //   { id: 4, name: 'Insulin Syringes', stock: 2, category: 'Medical Devices' },
  //   { id: 5, name: 'Pain Relief Tablets', stock: 4, category: 'Analgesics' },
  // ];
  // const lowStockCount = mockLowStockItems.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 p-3 bg-red-100 rounded-full">
          <PackageWarning className="h-7 w-7 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">Low Stock Items</p>
          <p className="text-3xl font-bold text-gray-800">{lowStockCount}</p>
        </div>
      </div>
      <div className="mt-5 text-right">
        <a 
          href="#" 
          onClick={(e) => e.preventDefault()} // Prevent default for now
          className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-150 ease-in-out"
        >
          View All Items &rarr;
        </a>
      </div>
    </div>
  );
}
