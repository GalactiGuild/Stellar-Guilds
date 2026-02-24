import { format, subDays } from 'date-fns';
import {
  ActivityDataPoint,
  EarningsDataPoint,
  ReputationData,
  EngagementMetrics,
} from './types';

/**
 * API Service Adapter for Analytics.
 * This service abstracts the data fetching logic from the React components.
 * 
 * Future Backend Integration:
 * To connect to a real backend, toggle NEXT_PUBLIC_USE_MOCK_DATA to 'false'
 * in your .env file, and replace the mock generation logic below with 
 * standard fetch() or axios calls to your actual API endpoints.
 */

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'; // Defaults to true if undefined

// --- MOCK DATA GENERATORS ---

const generateActivityData = (days: number): ActivityDataPoint[] => {
  return Array.from({ length: days }).map((_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
    contributions: Math.floor(Math.random() * 10),
    proposals: Math.floor(Math.random() * 3),
    votes: Math.floor(Math.random() * 5),
  }));
};

const generateEarningsData = (days: number): EarningsDataPoint[] => {
  const sources = ['Bounty', 'Grant', 'Tip'];
  return Array.from({ length: days }).map((_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
    amount: Math.floor(Math.random() * 500) + 50,
    source: sources[Math.floor(Math.random() * sources.length)],
  }));
};

const mockReputationData: ReputationData = {
  currentScore: 850,
  level: 'Expert Guild Member',
  nextLevelScore: 1000,
  percentToNextLevel: 85,
  history: Array.from({ length: 6 }).map((_, i) => ({
    date: format(subDays(new Date(), (5 - i) * 30), 'MMM yyyy'),
    score: 500 + i * 70 + Math.floor(Math.random() * 30),
  })),
};

const mockEngagementMetrics: EngagementMetrics = {
  userMetrics: {
    forumsPosted: 24,
    bountiesCompleted: 12,
    guildsJoined: 4,
    averageSessionTimeMin: 45,
  },
  platformBenchmarks: {
    forumsPosted: 15,
    bountiesCompleted: 5,
    guildsJoined: 2,
    averageSessionTimeMin: 25,
  },
};

// --- SIMULATED NETWORK HELPER ---

// Simulates network latency and potential transient failures
const simulateNetwork = <T>(data: T, delay: number, successRate: number = 0.98): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Small chance to simulate a network error for realistic UI error state testing
      if (Math.random() > successRate) {
        reject(new Error('Network error: Failed to fetch analytics data.'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};

// --- SERVICE ENDPOINTS ---

export const analyticsService = {
  /**
   * Fetches the user's activity trends over a specified period.
   * @param days Number of days lookback
   */
  async fetchActivityTrends(days: number = 30): Promise<ActivityDataPoint[]> {
    if (USE_MOCK_DATA) {
      return simulateNetwork(generateActivityData(days), 800);
    }
    
    // REAL BACKEND IMPLEMENTATION:
    // const res = await fetch(`/api/analytics/activity?days=${days}`);
    // if (!res.ok) throw new Error('Failed to fetch activity trends');
    // return res.json();
    throw new Error("Real backend endpoint not implemented yet.");
  },

  /**
   * Fetches the user's earnings history over a specified period.
   * @param days Number of days lookback
   */
  async fetchEarningsHistory(days: number = 30): Promise<EarningsDataPoint[]> {
    if (USE_MOCK_DATA) {
      return simulateNetwork(generateEarningsData(days), 1000);
    }
    
    // REAL BACKEND IMPLEMENTATION:
    // const res = await fetch(`/api/analytics/earnings?days=${days}`);
    // if (!res.ok) throw new Error('Failed to fetch earnings history');
    // return res.json();
    throw new Error("Real backend endpoint not implemented yet.");
  },

  /**
   * Fetches the user's current reputation score and historical progression.
   */
  async fetchReputationScore(): Promise<ReputationData> {
    if (USE_MOCK_DATA) {
      return simulateNetwork(mockReputationData, 600);
    }

    // REAL BACKEND IMPLEMENTATION:
    // const res = await fetch('/api/analytics/reputation');
    // if (!res.ok) throw new Error('Failed to fetch reputation score');
    // return res.json();
    throw new Error("Real backend endpoint not implemented yet.");
  },

  /**
   * Fetches the user's engagement metrics compared to platform benchmarks.
   */
  async fetchEngagementMetrics(): Promise<EngagementMetrics> {
    if (USE_MOCK_DATA) {
      return simulateNetwork(mockEngagementMetrics, 1200);
    }

    // REAL BACKEND IMPLEMENTATION:
    // const res = await fetch('/api/analytics/engagement');
    // if (!res.ok) throw new Error('Failed to fetch engagement metrics');
    // return res.json();
    throw new Error("Real backend endpoint not implemented yet.");
  },
};
