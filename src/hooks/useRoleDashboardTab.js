'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function useRoleDashboardTab(tabMap, defaultTab = '') {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab');
  
  const activeTab = Object.keys(tabMap).includes(activeTabParam) 
    ? activeTabParam 
    : defaultTab;

  const changeTab = (tabKey) => {
    if (Object.keys(tabMap).includes(tabKey)) {
      router.push(`?tab=${tabKey}`);
    }
  };

  return {
    activeTab,
    activeView: tabMap[activeTab],
    setActiveTab: changeTab
  };
}
