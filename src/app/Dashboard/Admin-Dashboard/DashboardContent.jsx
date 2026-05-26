// components/DashboardContent.jsx
import React from 'react';
import KPIGrid from './KPIGrid';
import PendingTasks from './PendingTasks';
import SystemActivityLog from './SystemActivityLog';
import DepartmentPerformance from './DepartmentPerformance';

const DashboardContent = () => {
  return (
    <div className="p-6 md:p-8 flex-1 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex text-on-surface-variant font-label-sm text-label-sm mb-2">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a href="#" className="hover:text-primary transition-colors">Home</a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-sm mx-1">chevron_right</span>
                  <span className="text-on-surface">Admin Control Center</span>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="font-display-lg text-display-lg md:font-display-lg md:text-display-lg font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Admin Control Center
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="font-label-md text-label-md text-on-surface">System Online</span>
        </div>
      </div>

      <KPIGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingTasks />
        <SystemActivityLog />
      </div>

      <DepartmentPerformance />
    </div>
  );
};

export default DashboardContent;