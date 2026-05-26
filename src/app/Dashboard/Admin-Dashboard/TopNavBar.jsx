// components/TopNavBar.jsx
import React from 'react';

const TopNavBar = () => {
  const headerIcons = ['notifications', 'shield', 'account_circle'];

  return (
    <header className="bg-background dark:bg-background border-b border-outline-variant dark:border-outline-variant flex justify-between items-center w-full px-6 py-3 h-16 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-surface-variant p-2">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-title-md text-title-md font-bold text-on-surface dark:text-on-surface hidden md:block">
          Institutional Admin Portal
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {headerIcons.map((icon, index) => (
          <button
            key={index}
            className="text-on-surface-variant hover:text-primary-fixed-dim transition-colors p-2 active:opacity-80"
          >
            <span className="material-symbols-outlined">{icon}</span>
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopNavBar;