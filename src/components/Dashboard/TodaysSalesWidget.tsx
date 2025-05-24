'use client';

import { DollarSign } from 'lucide-react';

export default function TodaysSalesWidget() {
  // Mock Data
  const todaysSalesAmount = 525.75;

  const formattedSalesAmount = todaysSalesAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD', // Or your preferred currency
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
          <DollarSign className="h-7 w-7 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">Today's Sales</p>
          <p className="text-3xl font-bold text-gray-800">{formattedSalesAmount}</p>
        </div>
      </div>
      <div className="mt-5 text-right">
        <a 
          href="#" 
          onClick={(e) => e.preventDefault()} // Prevent default for now
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-150 ease-in-out"
        >
          View Sales Report &rarr;
        </a>
      </div>
    </div>
  );
}
