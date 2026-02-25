"use client";

import React, { useState } from 'react';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { ActivityTrendsWidget } from './ActivityTrendsWidget';
import { EarningsTrackerWidget } from './EarningsTrackerWidget';
import { ReputationScoreWidget } from './ReputationScoreWidget';
import { EngagementMetricsWidget } from './EngagementMetricsWidget';
import { exportDataToCSV } from '@/features/analytics/exportUtils';
import { useActivityTrends, useEarningsHistory } from '@/hooks/useAnalytics/useAnalytics';
import { Settings2, Download, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming basic Button exists, or we use native button styled with Tailwind

const WIDGET_TITLES: Record<string, string> = {
  activity: 'Activity Trends',
  earnings: 'Earnings History',
  reputation: 'Reputation Score',
  engagement: 'Engagement Metrics'
};

const WIDGET_COMPONENTS: Record<string, React.FC> = {
  activity: ActivityTrendsWidget,
  earnings: EarningsTrackerWidget,
  reputation: ReputationScoreWidget,
  engagement: EngagementMetricsWidget,
};

export const AnalyticsDashboard: React.FC = () => {
  const { layouts, updateLayout } = useAnalyticsStore();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Prefetch data for export if needed (simplified for demonstration)
  const { data: activityData } = useActivityTrends();
  const { data: earningsData } = useEarningsHistory();

  const handleExport = () => {
    setIsExporting(true);
    try {
      if (activityData.length > 0) {
         exportDataToCSV(activityData, 'stellar_guilds_activity.csv');
      }
      setTimeout(() => {
        if (earningsData.length > 0) {
           exportDataToCSV(earningsData, 'stellar_guilds_earnings.csv');
        }
        setIsExporting(false);
      }, 500);
    } catch (e) {
      console.error('Export failed', e);
      setIsExporting(false);
    }
  };

  const toggleWidgetVisibility = (id: string, currentlyVisible: boolean) => {
    updateLayout(id, { visible: !currentlyVisible });
  };

  const activeLayouts = layouts.filter((l) => l.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#080b16] p-6 rounded-2xl border border-slate-800/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-500" />
            Real Impact
          </h1>
          <p className="text-slate-400 mt-1">Analytics about your activity, earnings, and engagement on Stellar Guilds.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isCustomizing 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            {isCustomizing ? 'Done' : 'Customize'}
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      {isCustomizing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-xl border border-indigo-500/30">
          {layouts.map((layout) => (
            <div key={`ctrl-${layout.id}`} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-slate-300 font-medium">{WIDGET_TITLES[layout.id]}</span>
              <button
                onClick={() => toggleWidgetVisibility(layout.id, layout.visible)}
                className={`p-2 rounded-md transition-colors ${
                  layout.visible ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-slate-500'
                }`}
              >
                {layout.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Widgets Grid */}
      {activeLayouts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
          <p className="text-slate-400">All widgets are hidden.</p>
          <button 
            onClick={() => setIsCustomizing(true)}
            className="text-indigo-400 mt-2 hover:underline"
          >
            Customize Layout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
          {activeLayouts.map((layout) => {
            const WidgetComponent = WIDGET_COMPONENTS[layout.id];
            if (!WidgetComponent) return null;

            // Make some widgets span full width based on their ID if desired
            const colSpanClass = layout.id === 'activity' ? 'lg:col-span-2' : 'lg:col-span-1';

            return (
              <div 
                key={`widget-${layout.id}`} 
                className={`min-h-[400px] transition-all duration-300 ${colSpanClass} ${
                  isCustomizing ? 'ring-2 ring-indigo-500/50 scale-[0.98]' : ''
                }`}
              >
                <WidgetComponent />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
