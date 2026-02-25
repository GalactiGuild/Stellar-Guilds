"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useReputationScore } from '@/hooks/useAnalytics/useAnalytics';
import { Award, Trophy, Star } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const ReputationScoreWidget: React.FC = () => {
  const { data, loading, error } = useReputationScore();

  if (loading) {
    return (
      <Card className="h-full flex flex-col justify-center items-center bg-[#0b1021] min-h-[300px]">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="h-full flex flex-col justify-center items-center bg-[#0b1021] min-h-[300px]">
         <p className="text-red-400 text-sm text-center px-4">{error || 'Failed to load reputation'}</p>
      </Card>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    circumference: 180,
    rotation: 270,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  const chartDataObj = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [data.percentToNextLevel, 100 - data.percentToNextLevel],
        backgroundColor: ['#f59e0b', '#1e293b'],
        borderWidth: 0,
        borderRadius: 10
      }
    ]
  };

  return (
    <Card className="h-full flex flex-col bg-[#0b1021]">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-white">Reputation</h3>
      </div>
      <p className="text-sm text-slate-400 mb-6">{data.level}</p>

      <div className="flex-grow relative flex items-center justify-center min-h-[200px]">
        <div className="absolute inset-x-0 top-0 bottom-12">
          <Doughnut options={chartOptions} data={chartDataObj} />
        </div>
        
        {/* Center content */}
        <div className="text-center z-10 flex flex-col items-center mt-12">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500 mb-1 opacity-20" />
          <span className="text-4xl font-bold text-white tracking-tight">{data.currentScore}</span>
          <span className="text-xs font-medium text-amber-500 mt-1 uppercase tracking-wider">Score</span>
        </div>
      </div>

      <div className="mt-6 space-y-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Next Milestone</span>
          <span className="text-white font-medium flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            {data.nextLevelScore}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all duration-1000 ease-out relative" 
            style={{ width: `${data.percentToNextLevel}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-right">
          {data.nextLevelScore - data.currentScore} pts remaining
        </p>
      </div>
    </Card>
  );
};
