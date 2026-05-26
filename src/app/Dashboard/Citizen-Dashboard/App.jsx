// App.js
import React, { useState } from 'react';

const App = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-surface-dim font-body-md text-body-md text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar */}
      <nav className="bg-surface-bright dark:bg-surface-dim sticky top-0 z-50 bg-surface-bright/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto px-margin flex justify-between items-center h-20 w-full">
          {/* Brand */}
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed text-3xl">account_balance</span>
            <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed">City Central</span>
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-lg">
            <a className="text-primary dark:text-primary-fixed border-b-4 border-secondary pb-1 transition-all opacity-80 scale-95 flex flex-col items-center justify-center h-full pt-1" href="#">
              <span className="font-label-md text-label-md">Services</span>
            </a>
            <a className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">
              Departments
            </a>
            <a className="text-on-surface-variant dark:text-surface-variant font-label-md text-label-md hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">
              News
            </a>
          </div>
          
          {/* Trailing Action */}
          <div className="flex items-center gap-md">
            <button className="hidden md:flex bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-label-md text-label-md px-lg py-sm rounded-full transition-all items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">report</span>
              Report an Issue
            </button>
            <button 
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-container border-t border-outline-variant/30 p-md flex flex-col gap-md">
            <a className="text-primary font-label-md text-label-md py-sm" href="#">Services</a>
            <a className="text-on-surface-variant font-label-md text-label-md py-sm" href="#">Departments</a>
            <a className="text-on-surface-variant font-label-md text-label-md py-sm" href="#">News</a>
            <button className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-label-md text-label-md px-lg py-sm rounded-full transition-all flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">report</span>
              Report an Issue
            </button>
          </div>
        )}
      </nav>

      <div className="flex flex-1 overflow-hidden w-full max-w-[1440px] mx-auto">
        {/* Sidebar Navigation - Desktop */}
        <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 hidden lg:flex flex-col py-lg px-md gap-sm shrink-0">
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm px-sm">Dashboard</div>
          <a className="flex items-center gap-md px-md py-sm rounded-lg bg-surface-container-high text-primary border-l-4 border-primary shadow-sm" href="#">
            <span className="material-symbols-outlined fill">person</span>
            <span className="font-label-md text-label-md">My Profile</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors border-l-4 border-transparent hover:border-outline-variant/50" href="#">
            <span className="material-symbols-outlined">folder_open</span>
            <span className="font-label-md text-label-md">Documents</span>
          </a>
          <a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors border-l-4 border-transparent hover:border-outline-variant/50" href="#">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-label-md text-label-md">Payment History</span>
          </a>
          <div className="mt-auto pt-lg border-t border-outline-variant/30">
            <a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
              <span className="material-symbols-outlined">help_center</span>
              <span className="font-label-md text-label-md">Support</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-margin md:p-xl bg-surface-dim">
          {/* Welcome Banner & Search */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-margin mb-xl">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Welcome back, Jane</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Manage your civic services, documents, and community updates.</p>
            </div>
            <div className="relative w-full lg:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input 
                className="block w-full pl-12 pr-md py-3 bg-surface-container border border-outline-variant rounded-full text-on-surface placeholder-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm font-body-md text-body-md" 
                placeholder="Find a service or document..." 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-margin">
            {/* Profile Summary Card */}
            <div className="md:col-span-12 lg:col-span-4 bg-surface-container-low border border-outline-variant/30 rounded-xl p-margin flex flex-col relative overflow-hidden group hover:border-outline-variant/60 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center gap-md mb-margin relative z-10">
                <img alt="Profile Avatar" className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNxX-VKVstlmd21-KDaeZymleHYDATouQaoC7UjTmk7HG2h6wwquUiWvoUwp6iA3_p_SCGFFUg8_URsegAp42wPFS5Oycc4exVdOFoLV2YvDtiKmkHT3uVlFoL4ePjki5V-pKjo5HpWipYWDCzPtlcY0QNF0fZV033nYNw5XGRY4owReikJOzscRDIwuQDBrObPL0hZnBBEa4_DyFyfLmub4UcnBR-ESrMIqBpldZzqdVLUpVXsR4mJwYCwo3pXxbkAN7hGWVjRpI"/>
                <div>
                  <h2 className="font-title-md text-title-md text-on-surface">Jane Doe</h2>
                  <div className="flex items-center gap-xs mt-1">
                    <span className="material-symbols-outlined text-primary text-[16px] fill">verified</span>
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wide">Verified Account</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto space-y-sm bg-surface-container p-sm rounded-lg border border-outline-variant/20 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Last Login</span>
                  <span className="font-body-md text-body-md text-on-surface">Today, 09:41 AM</span>
                </div>
                <div className="w-full h-px bg-outline-variant/20"></div>
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Resident ID</span>
                  <span className="font-body-md text-body-md text-on-surface font-mono">CTY-892-441</span>
                </div>
              </div>
            </div>

            {/* My Services Grid */}
            <div className="md:col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant/30 rounded-xl p-margin flex flex-col">
              <div className="flex justify-between items-center mb-margin">
                <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">dashboard</span>
                  My Services
                </h3>
                <button className="font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm flex-1">
                <ServiceCard 
                  icon="delete" 
                  title="Waste Management" 
                  subtitle="Collection Tomorrow" 
                  status="Active"
                  statusColor="bg-surface-bright text-on-surface-variant"
                />
                <ServiceCard 
                  icon="water_drop" 
                  title="Water Utility" 
                  subtitle="Current Bill: $42.00" 
                  status="Due Soon"
                  statusColor="bg-error/10 text-error"
                />
                <ServiceCard 
                  icon="local_parking" 
                  title="Parking Permits" 
                  subtitle="Zone A - Expires Dec '24" 
                  status="Active"
                  statusColor="bg-surface-bright text-on-surface-variant"
                />
                <ServiceCard 
                  icon="real_estate_agent" 
                  title="Property Tax" 
                  subtitle="2024 Assessment Sent" 
                  status="Paid"
                  statusColor="bg-surface-bright text-on-surface-variant"
                />
              </div>
            </div>

            {/* Document Vault Shortcut */}
            <div className="md:col-span-6 lg:col-span-4 bg-surface-container-low border border-outline-variant/30 rounded-xl p-margin">
              <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-sm mb-margin">
                <span className="material-symbols-outlined text-primary">shield_lock</span>
                Document Vault
              </h3>
              <div className="space-y-sm">
                <DocumentItem icon="badge" label="Digital ID Card" actionIcon="download" />
                <DocumentItem icon="description" label="Property Deed" actionIcon="open_in_new" />
              </div>
              <button className="w-full mt-margin py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors">
                Open Vault
              </button>
            </div>

            {/* Upcoming Appointments */}
            <div className="md:col-span-6 lg:col-span-4 bg-primary-container text-on-primary-container rounded-xl p-margin relative overflow-hidden shadow-sm">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                <span className="material-symbols-outlined text-[120px]">calendar_month</span>
              </div>
              <h3 className="font-title-md text-title-md flex items-center gap-sm mb-margin relative z-10">
                <span className="material-symbols-outlined">event</span>
                Next Appointment
              </h3>
              <div className="bg-on-primary-container/10 p-md rounded-lg backdrop-blur-sm relative z-10 border border-on-primary-container/10">
                <div className="flex justify-between items-start mb-sm">
                  <h4 className="font-label-md text-label-md font-bold">Building Permit Inspection</h4>
                  <span className="bg-on-primary-container text-primary-container text-[10px] font-bold px-2 py-1 rounded uppercase">Confirmed</span>
                </div>
                <div className="flex items-center gap-sm font-body-md text-body-md opacity-90 mb-xs">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  Tomorrow, 10:00 AM - 11:30 AM
                </div>
                <div className="flex items-center gap-sm font-body-md text-body-md opacity-90">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  1422 Elm Street, Zone B
                </div>
              </div>
            </div>

            {/* Community Feed */}
            <div className="md:col-span-12 lg:col-span-4 bg-surface-container-low border border-outline-variant/30 rounded-xl p-margin flex flex-col h-full">
              <div className="flex justify-between items-center mb-margin">
                <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">forum</span>
                  Community
                </h3>
              </div>
              <div className="space-y-md flex-1">
                <CommunityEvent date="Oct 12" title="Town Hall Meeting" description="Annual budget review and public Q&amp;A session at the Civic Center." />
                <div className="w-full h-px bg-outline-variant/20"></div>
                <CommunityEvent date="Oct 15" title="Central Farmers Market" description="Local vendors, fresh produce, and community workshops." />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-primary dark:bg-primary-container border-t border-outline-variant/30 relative z-10 mt-auto">
        <div className="max-w-[1440px] mx-auto px-margin py-xl grid grid-cols-1 md:grid-cols-4 gap-gutter w-full">
          <div className="col-span-1 flex flex-col gap-sm">
            <div className="text-headline-md font-headline-md font-bold text-on-primary dark:text-on-primary-container">City Central</div>
            <p className="font-body-md text-body-md text-on-primary dark:text-on-primary-container opacity-80 max-w-xs">
              Empowering citizens through transparent and efficient municipal digital services.
            </p>
          </div>
          <div className="col-span-1 md:col-span-3 flex flex-wrap gap-x-lg gap-y-md md:justify-end items-start pt-2">
            <FooterLink href="#">Contact Us</FooterLink>
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Public Notices</FooterLink>
            <FooterLink href="#">Official Documents</FooterLink>
            <FooterLink href="#">Terms of Service</FooterLink>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-margin py-md border-t border-on-primary-container/10 flex flex-col md:flex-row justify-between items-center gap-sm">
          <span className="font-label-md text-label-md text-on-primary dark:text-on-primary-container opacity-70">
            © 2024 Municipal Corporation. All rights reserved.
          </span>
          <div className="flex gap-md">
            <span className="material-symbols-outlined text-on-primary-container opacity-70 hover:opacity-100 cursor-pointer">language</span>
            <span className="material-symbols-outlined text-on-primary-container opacity-70 hover:opacity-100 cursor-pointer">accessibility_new</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const ServiceCard = ({ icon, title, subtitle, status, statusColor }) => (
  <div className="bg-surface-container p-md rounded-lg border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-high transition-all cursor-pointer group flex flex-col justify-between">
    <div className="flex items-start justify-between mb-sm">
      <div className="p-xs bg-primary/10 rounded-md text-primary group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{status}</span>
    </div>
    <div>
      <h4 className="font-label-md text-label-md text-on-surface mb-xs">{title}</h4>
      <p className="font-body-md text-body-md text-secondary">{subtitle}</p>
    </div>
  </div>
);

const DocumentItem = ({ icon, label, actionIcon }) => (
  <div className="flex items-center justify-between p-sm bg-surface-container rounded-lg border border-outline-variant/20 hover:bg-surface-container-high cursor-pointer transition-colors group">
    <div className="flex items-center gap-sm">
      <span className="material-symbols-outlined text-secondary-fixed-dim">{icon}</span>
      <span className="font-label-md text-label-md text-on-surface">{label}</span>
    </div>
    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px]">{actionIcon}</span>
  </div>
);

const CommunityEvent = ({ date, title, description }) => (
  <div className="flex gap-md group cursor-pointer">
    <div className="w-12 h-12 rounded-lg bg-surface-container border border-outline-variant/50 flex flex-col items-center justify-center shrink-0 group-hover:border-primary transition-colors">
      <span className="font-label-sm text-label-sm text-primary uppercase leading-tight">{date.split(' ')[0]}</span>
      <span className="font-title-md text-title-md text-on-surface leading-tight">{date.split(' ')[1]}</span>
    </div>
    <div>
      <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{title}</h4>
      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-xs">{description}</p>
    </div>
  </div>
);

const FooterLink = ({ href, children }) => (
  <a 
    href={href} 
    className="text-on-primary dark:text-on-primary-container opacity-80 hover:opacity-100 hover:underline transition-all font-label-md text-label-md focus:ring-2 focus:ring-secondary focus:ring-offset-2 outline-none rounded"
  >
    {children}
  </a>
);

export default App;