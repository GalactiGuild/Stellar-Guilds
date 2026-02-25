"use client";

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useEarningsHistory } from '@/hooks/useAnalytics/useAnalytics';
import { DollarSign } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const EarningsTrackerWidget: React.FC = () => {
  const { data, loading, error } = useEarningsHistory(14);

  const totalEarnings = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0);
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#0f172a', 
        titleColor: '#fff', 
        bodyColor: '#e2e8f0', 
        borderColor: '#1e293b', 
        borderWidth: 1,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (context: any) => `Amount: $${context.raw}`
        }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ticks: { color: '#64748b', callback: (value: any) => `$${value}` }, 
        border: { display: false } 
      }
    }
  };

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Amount',
        data: data.map(d => d.amount),
        backgroundColor: data.map(d => d.source === 'Bounty' ? '#10b981' : d.source === 'Grant' ? '#3b82f6' : '#f59e0b'),
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  };

  return (
    <Card className="h-full flex flex-col bg-[#0b1021]">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Earnings History</h3>
            {loading ? (
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse mt-1"></div>
            ) : error ? (
              <p className="text-sm font-medium text-red-400 mt-1">Data unavailable</p>
            ) : (
              <p className="text-2xl font-bold text-emerald-400 mt-1">${totalEarnings.toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-grow min-h-[250px] w-full relative">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
           </div>
        ) : error ? (
           <div className="absolute inset-0 flex items-center justify-center">
             <p className="text-red-400 text-sm text-center px-4">{error}</p>
           </div>
        ) : (
          <Bar options={chartOptions} data={chartData} />
        )}
      </div>
      {!loading && !error && (
        <div className="flex gap-4 mt-4 justify-center text-xs text-slate-400">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Bounty</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span> Grant</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Tip</div>
        </div>
      )}
    </Card>
  );
};
