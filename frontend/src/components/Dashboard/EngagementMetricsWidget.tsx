"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useEngagementMetrics } from '@/hooks/useAnalytics/useAnalytics';
import { Target } from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const EngagementMetricsWidget: React.FC = () => {
  const { data, loading, error } = useEngagementMetrics();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        grid: { color: '#1e293b' },
        angleLines: { color: '#1e293b' },
        pointLabels: { color: '#e2e8f0', font: { size: 12 } },
        ticks: { display: false, backdropColor: 'transparent' }
      }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#e2e8f0'} },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: '#1e293b', borderWidth: 1 }
    }
  };

  let chartDataObj: { labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number }[] } = { labels: [], datasets: [] };
  if (data) {
    chartDataObj = {
      labels: ['Forums', 'Bounties', 'Guilds', 'Session (m)'],
      datasets: [
        {
          label: 'You',
          data: [data.userMetrics.forumsPosted, data.userMetrics.bountiesCompleted, data.userMetrics.guildsJoined, data.userMetrics.averageSessionTimeMin],
          backgroundColor: 'rgba(244, 63, 94, 0.4)',
          borderColor: '#f43f5e',
          borderWidth: 2,
        },
        {
          label: 'Avg User',
          data: [data.platformBenchmarks.forumsPosted, data.platformBenchmarks.bountiesCompleted, data.platformBenchmarks.guildsJoined, data.platformBenchmarks.averageSessionTimeMin],
          backgroundColor: 'rgba(100, 116, 139, 0.3)',
          borderColor: '#64748b',
          borderWidth: 2,
        }
      ]
    };
  }

  return (
    <Card className="h-full flex flex-col bg-[#0b1021]">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-rose-500" />
        <h3 className="text-lg font-semibold text-white">Engagement vs Benchmark</h3>
      </div>
      
      <div className="flex-grow min-h-[300px] w-full relative">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
           </div>
        ) : error || !data ? (
           <div className="absolute inset-0 flex items-center justify-center">
             <p className="text-red-400 text-sm text-center px-4">{error || 'Failed to load engagement metrics'}</p>
           </div>
        ) : (
          <Radar options={chartOptions} data={chartDataObj} />
        )}
      </div>
    </Card>
  );
};
