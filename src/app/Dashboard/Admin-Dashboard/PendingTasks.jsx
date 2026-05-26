// components/PendingTasks.jsx
import React from 'react';

const PendingTasks = () => {
  const tasks = [
    {
      id: '4092',
      title: 'Residential Deck Permit',
      time: 'Submitted 2 hrs ago',
      department: 'Zoning',
      priority: 'High',
      priorityClass: 'bg-error/10 text-error border border-error/20'
    },
    {
      id: '9921',
      title: 'Bulk Trash Scheduling Request',
      time: 'Submitted 5 hrs ago',
      department: 'Public Works',
      priority: 'Medium',
      priorityClass: 'bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20'
    },
    {
      id: '8830',
      title: 'Water Main Inspection Review',
      time: 'Submitted 1 day ago',
      department: 'Utilities',
      priority: 'High',
      priorityClass: 'bg-error/10 text-error border border-error/20'
    }
  ];

  return (
    <div className="lg:col-span-2 bg-surface-container border border-outline-variant/50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-title-md text-title-md text-on-surface">Urgent Departmental Tasks</h3>
        <button className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
              <th className="pb-3 pr-4 font-semibold">Task ID & Description</th>
              <th className="pb-3 px-4 font-semibold">Department</th>
              <th className="pb-3 px-4 font-semibold">Priority</th>
              <th className="pb-3 pl-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md divide-y divide-outline-variant/20">
            {tasks.map((task, index) => (
              <tr key={index} className="hover:bg-surface-container-high transition-colors group">
                <td className="py-4 pr-4">
                  <div className="text-on-surface font-medium">{task.title}</div>
                  <div className="text-on-surface-variant font-label-sm text-label-sm">
                    #{task.id} • {task.time}
                  </div>
                </td>
                <td className="py-4 px-4 text-on-surface-variant">{task.department}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${task.priorityClass}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-4 pl-4 text-right">
                  <button className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors border border-primary/20">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingTasks;