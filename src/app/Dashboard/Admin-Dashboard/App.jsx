// App.jsx
import React from 'react';
import SideNavBar from './components/SideNavBar';
import TopNavBar from './components/TopNavBar';
import DashboardContent from './components/DashboardContent';

function App() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <SideNavBar />
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        <TopNavBar />
        <DashboardContent />
      </main>
    </div>
  );
}

export default App;