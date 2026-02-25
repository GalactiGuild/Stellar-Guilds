"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useActivityTrends } from '@/hooks/useAnalytics/useAnalytics';
import { Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const ActivityTrendsWidget: React.FC = () => {
  const { data, loading, error } = useActivityTrends(30);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const, 
        labels: { color: '#e2e8f0', usePointStyle: true, boxWidth: 8 } 
      },
      tooltip: { 
        backgroundColor: '#0f172a', 
        titleColor: '#fff', 
        bodyColor: '#e2e8f0', 
        borderColor: '#1e293b', 
        borderWidth: 1 
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748b' }, 
        border: { display: false } 
      },
      y: { 
        grid: { color: '#1e293b', borderDash: [3, 3] }, 
        ticks: { color: '#64748b' }, 
        border: { display: false } 
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        fill: true,
        label: 'Contributions',
        data: data.map(d => d.contributions),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      },
      {
        fill: true,
        label: 'Proposals',
        data: data.map(d => d.proposals),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4
      }
    ]
  };

  return (
    <Card className="h-full flex flex-col bg-[#0b1021]">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Activity Trends</h3>
      </div>
      
      <div className="flex-grow min-h-[300px] w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-400 text-sm text-center px-4">{error}</p>
          </div>
        ) : (
          <Line options={chartOptions} data={chartData} />
        )}
      </div>
    </Card>
  );
};
