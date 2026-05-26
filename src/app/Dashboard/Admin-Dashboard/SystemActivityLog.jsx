// components/SystemActivityLog.jsx
import React from 'react';

const SystemActivityLog = () => {
  const activities = [
    {
      time: 'Just now',
      color: 'bg-primary',
      content: <><span className="font-medium">Admin J. Doe</span> logged in successfully from secure IP.</>
    },
    {
      time: '45 mins ago',
      color: 'bg-secondary-fixed',
      content: (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary-fixed text-sm">backup</span>
          Automated database backup completed.
        </div>
      )
    },
    {
      time: '2 hours ago',
      color: 'bg-tertiary-container',
      content: 'System security scan finished. 0 vulnerabilities found.'
    }
  ];

  return (
    <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-title-md text-title-md text-on-surface">System Activity Log</h3>
        <span className="material-symbols-outlined text-on-surface-variant">history</span>
      </div>
      
      <div className="flex-1 relative border-l border-outline-variant/30 ml-3 space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="relative pl-6">
            <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${activity.color} ring-4 ring-surface-container`}></div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">{activity.time}</div>
            <div className="font-body-md text-body-md text-on-surface bg-surface-container-highest p-3 rounded-lg border border-outline-variant/20">
              {activity.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemActivityLog;