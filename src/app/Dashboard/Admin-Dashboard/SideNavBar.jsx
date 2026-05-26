// components/SideNavBar.jsx
import React from 'react';

const SideNavBar = () => {
  const navItems = [
    { icon: 'dashboard', label: 'Overview', active: true, fill: true },
    { icon: 'verified_user', label: 'Departmental Approvals', active: false },
    { icon: 'assignment_turned_in', label: 'Service Requests', active: false },
    { icon: 'group', label: 'User Management', active: false },
    { icon: 'analytics', label: 'System Analytics', active: false },
  ];

  return (
    <nav className="hidden md:flex bg-surface-container dark:bg-surface-container fixed left-0 top-0 h-screen w-64 flex-col pt-16 z-40 border-r border-outline-variant">
      <div className="px-6 pb-8 border-b border-outline-variant/30">
        <h1 className="font-headline-lg text-headline-lg font-black text-primary">Admin Portal</h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Municipal Corp</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-r-lg font-label-md text-label-md transition-all ${
                  item.active
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary active:scale-[0.99]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={item.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-outline-variant/30">
        <div className="bg-surface-container-highest rounded-lg p-3 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">security</span>
          <span className="font-label-sm text-label-sm text-on-surface">System Status: Secure</span>
        </div>
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high font-label-md text-label-md rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">settings</span>
              Settings
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 text-error px-4 py-3 hover:bg-error/10 font-label-md text-label-md rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SideNavBar;