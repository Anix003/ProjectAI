// components/KPIGrid.jsx
import React from 'react';

const KPIGrid = () => {
  const kpiCards = [
    {
      id: 1,
      title: 'Active Service Requests',
      value: '1,248',
      icon: 'assignment',
      trend: { text: '+12% this week', icon: 'trending_up', className: 'text-primary' },
      accentColor: 'bg-primary/5',
      hoverColor: 'hover:bg-primary/10',
      hoverBorder: 'hover:border-primary/50'
    },
    {
      id: 2,
      title: 'Pending Approvals',
      value: '84',
      icon: 'pending_actions',
      trend: { text: '12 urgent', icon: 'warning', className: 'text-error' },
      accentColor: 'bg-tertiary-container/5',
      hoverColor: 'hover:bg-tertiary-container/10',
      hoverBorder: 'hover:border-tertiary-container/50',
      iconColor: 'text-tertiary-container'
    },
    {
      id: 3,
      title: 'Citizen Satisfaction',
      value: '84%',
      icon: 'sentiment_satisfied',
      progressBar: true,
      progressValue: 84,
      accentColor: '',
      hoverColor: '',
      hoverBorder: 'hover:border-primary-fixed/50',
      iconColor: 'text-primary-fixed'
    },
    {
      id: 4,
      title: 'System Uptime',
      value: '99.9%',
      icon: 'dns',
      subtitle: 'Last 30 days',
      accentColor: '',
      hoverColor: '',
      hoverBorder: 'hover:border-secondary-fixed/50',
      iconColor: 'text-secondary-fixed'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card) => (
        <div
          key={card.id}
          className={`bg-surface-container border border-outline-variant/50 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group ${card.hoverBorder} transition-colors`}
        >
          {card.accentColor && (
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.accentColor} rounded-full blur-xl ${card.hoverColor} transition-colors`}></div>
          )}
          
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-on-surface-variant">{card.title}</span>
            <span className={`material-symbols-outlined ${card.iconColor || 'text-primary'}`}>{card.icon}</span>
          </div>
          
          <div>
            <span className="font-headline-lg text-headline-lg text-on-surface block">{card.value}</span>
            
            {card.trend && (
              <span className={`font-label-sm text-label-sm ${card.trend.className} flex items-center gap-1 mt-1`}>
                <span className="material-symbols-outlined text-xs">{card.trend.icon}</span>
                {card.trend.text}
              </span>
            )}
            
            {card.progressBar && (
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-3">
                <div className="bg-primary-fixed h-1.5 rounded-full" style={{ width: `${card.progressValue}%` }}></div>
              </div>
            )}
            
            {card.subtitle && (
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-1 block">{card.subtitle}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIGrid;