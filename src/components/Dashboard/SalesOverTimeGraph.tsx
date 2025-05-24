'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockSalesData = [
  { date: 'Mon', sales: 400 },
  { date: 'Tue', sales: 300 },
  { date: 'Wed', sales: 600 },
  { date: 'Thu', sales: 800 },
  { date: 'Fri', sales: 500 },
  { date: 'Sat', sales: 700 },
  { date: 'Sun', sales: 900 },
];

export default function SalesOverTimeGraph() {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out h-80 md:h-96"> {/* Adjusted height for responsiveness */}
      <h3 className="text-md md:text-lg font-semibold text-gray-700 mb-4">Sales Over Time</h3>
      <ResponsiveContainer width="100%" height="90%"> {/* Adjusted height to accommodate title */}
        <LineChart 
          data={mockSalesData} 
          margin={{ 
            top: 5, 
            right: 20, // Adjusted for better spacing on the right
            left: -20, // Adjusted to bring Y-axis labels closer or into view
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#666' }} 
            stroke="#aaa" 
            axisLine={{ stroke: "#aaa" }}
            tickLine={{ stroke: "#aaa" }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#666' }} 
            stroke="#aaa" 
            axisLine={{ stroke: "#aaa" }}
            tickLine={{ stroke: "#aaa" }}
            tickFormatter={(value) => `$${value}`} // Format Y-axis ticks as currency
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '0.375rem', // Tailwind's rounded-md
              border: '1px solid #e2e8f0', // Tailwind's gray-200
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Tailwind's shadow-lg
              backdropFilter: 'blur(4px)'
            }}
            itemStyle={{ color: '#374151' }} // Tailwind's gray-700
            labelStyle={{ color: '#1f2937', fontWeight: '600' }} // Tailwind's gray-800, semibold
            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
            iconType="circle"
            iconSize={8}
          />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#3b82f6" // Tailwind's blue-500
            strokeWidth={2.5} 
            activeDot={{ r: 7, strokeWidth: 2, fill: '#3b82f6' }} 
            dot={{ r: 4, strokeWidth: 1, fill: '#fff', stroke: '#3b82f6' }}
            name="Sales"
          />
          {/* Example of another line if needed: 
          <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" /> // Tailwind's emerald-500
          */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
