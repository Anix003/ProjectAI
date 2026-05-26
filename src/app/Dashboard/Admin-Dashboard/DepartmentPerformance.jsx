// components/DepartmentPerformance.jsx
import React, { useState } from 'react';

const DepartmentPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  
  const departments = [
    { name: 'Public W.', height: '45%', hours: '18h', color: 'bg-primary/20', border: 'border-primary', hover: 'hover:bg-primary/30' },
    { name: 'Utilities', height: '65%', hours: '26h', color: 'bg-secondary-fixed/20', border: 'border-secondary-fixed', hover: 'hover:bg-secondary-fixed/30' },
    { name: 'Zoning', height: '85%', hours: '34h', color: 'bg-tertiary-container/20', border: 'border-tertiary-container', hover: 'hover:bg-tertiary-container/30' },
    { name: 'Parks', height: '30%', hours: '12h', color: 'bg-primary-fixed-dim/20', border: 'border-primary-fixed-dim', hover: 'hover:bg-primary-fixed-dim/30' }
  ];

  return (
    <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-title-md text-title-md text-on-surface">Departmental Response Times</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
            Average hours to resolve service requests
          </p>
        </div>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-surface-container-high border border-outline-variant text-on-surface text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>
      
      <div className="h-64 flex items-end justify-around gap-4 pt-8 border-b border-l border-outline-variant/30 pb-2 px-2 relative">
        <div className="absolute left-0 top-0 bottom-0 w-full flex flex-col justify-between text-xs text-on-surface-variant -ml-6 pb-2">
          <span>48h</span>
          <span>24h</span>
          <span>12h</span>
          <span>0h</span>
        </div>
        
        {departments.map((dept, index) => (
          <div
            key={index}
            className={`w-full max-w-[80px] ${dept.color} rounded-t-sm border-t-2 ${dept.border} relative group flex flex-col justify-end transition-all ${dept.hover}`}
            style={{ height: dept.height }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {dept.hours}
            </div>
            <div className="w-full text-center text-xs text-on-surface-variant absolute -bottom-6 truncate px-1">
              {dept.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentPerformance;