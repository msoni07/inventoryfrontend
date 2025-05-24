'use client';

import { ListChecks, TrendingUp } from 'lucide-react'; // Using TrendingUp as it might be more relevant

const mockTopSellingMedicines = [
  { id: '1', name: 'Paracetamol 500mg', quantitySold: 150, revenue: 300.50 },
  { id: '2', name: 'Amoxicillin 250mg', quantitySold: 120, revenue: 450.75 },
  { id: '3', name: 'Vitamin C 1000mg', quantitySold: 90, revenue: 199.99 },
  { id: '4', name: 'Ibuprofen 200mg', quantitySold: 85, revenue: 150.00 },
  { id: '5', name: 'Omeprazole 20mg', quantitySold: 70, revenue: 280.20 },
  // Add more if needed, but the component will slice the top 5
  { id: '6', name: 'Loratadine 10mg', quantitySold: 65, revenue: 180.00 }, 
];

export default function TopSellingWidget() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-700">Top Selling Medicines</h3>
        <TrendingUp className="h-6 w-6 text-sky-500" /> {/* Changed icon and color */}
      </div>
      <div className="space-y-3.5"> {/* Increased spacing slightly */}
        {mockTopSellingMedicines.slice(0, 5).map((medicine, index) => (
          <div 
            key={medicine.id} 
            className={`flex justify-between items-center p-3.5 rounded-lg transition-colors duration-150 ease-in-out ${
              index % 2 === 0 ? 'bg-slate-50 hover:bg-slate-100' : 'bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex-grow mr-3"> {/* Added flex-grow and margin */}
              <p className="text-sm font-medium text-gray-800 truncate" title={medicine.name}>{medicine.name}</p>
              <p className="text-xs text-gray-500">Sold: {medicine.quantitySold} units</p>
            </div>
            <p className="text-sm font-semibold text-green-600 whitespace-nowrap"> {/* Added whitespace-nowrap */}
              {medicine.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-right"> {/* Adjusted margin-top */}
        <a 
          href="#" 
          onClick={(e) => e.preventDefault()} // Prevent default for now
          className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors duration-150 ease-in-out"
        >
          View Full Report &rarr;
        </a>
      </div>
    </div>
  );
}
