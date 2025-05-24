'use client';

import LowStockWidget from '@/components/Dashboard/LowStockWidget';
import UpcomingExpiriesWidget from '@/components/Dashboard/UpcomingExpiriesWidget';
import TodaysSalesWidget from '@/components/Dashboard/TodaysSalesWidget';
import SalesOverTimeGraph from '@/components/Dashboard/SalesOverTimeGraph';
import TopSellingWidget from '@/components/Dashboard/TopSellingWidget';

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-1"> {/* Added slight padding for the overall container */}
      {/* Optional: General Page Title if AppLayout doesn't provide a dynamic one based on this main page */}
      {/* <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard Overview</h1> */}

      {/* Section for top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <LowStockWidget />
        <UpcomingExpiriesWidget />
        <TodaysSalesWidget />
      </div>

      {/* Section for larger charts/lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2"> {/* Sales graph taking 2/3 width on large screens */}
          <SalesOverTimeGraph />
        </div>
        <div className="lg:col-span-1"> {/* Top selling taking 1/3 width */}
          <TopSellingWidget />
        </div>
      </div>
      
      {/* 
        Alternative layout consideration (if TopSellingWidget felt too cramped):
        <div className="grid grid-cols-1 gap-6">
           <SalesOverTimeGraph /> // This would be full width
        </div>
        <div className="grid grid-cols-1 gap-6 mt-6"> // TopSellingWidget below, also full width
           <TopSellingWidget />
        </div>
      */}
    </div>
  );
}
