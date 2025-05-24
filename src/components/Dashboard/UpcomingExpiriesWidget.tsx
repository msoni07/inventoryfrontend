'use client';

import { CalendarClock } from 'lucide-react'; // Using CalendarClock as suggested

export default function UpcomingExpiriesWidget() {
  // Mock Data
  const upcomingExpiryCount = 3;
  // Example of more detailed mock data that could be used:
  // const mockUpcomingExpiries = [
  //   { id: 1, name: 'Product A', expiryDate: '2024-07-15', stock: 10 },
  //   { id: 2, name: 'Product B', expiryDate: '2024-07-20', stock: 5 },
  //   { id: 3, name: 'Product C', expiryDate: '2024-08-01', stock: 12 },
  // ];
  // const upcomingExpiryCount = mockUpcomingExpiries.length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 p-3 bg-amber-100 rounded-full">
          <CalendarClock className="h-7 w-7 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">Upcoming Expiries</p>
          <p className="text-3xl font-bold text-gray-800">{upcomingExpiryCount}</p>
        </div>
      </div>
      <div className="mt-5 text-right">
        <a 
          href="#" 
          onClick={(e) => e.preventDefault()} // Prevent default for now
          className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors duration-150 ease-in-out"
        >
          View Details &rarr;
        </a>
      </div>
    </div>
  );
}
