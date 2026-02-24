import { useState, useEffect } from 'react';
import {
  ActivityDataPoint,
  EarningsDataPoint,
  ReputationData,
  EngagementMetrics,
} from '../../features/analytics/types';
import { analyticsService } from '../../features/analytics/analyticsService';

// --- DATA FETCHING HOOKS ---

export const useActivityTrends = (days: number = 30) => {
  const [data, setData] = useState<ActivityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    analyticsService.fetchActivityTrends(days)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch activity trends');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [days]);

  return { data, loading, error };
};

export const useEarningsHistory = (days: number = 30) => {
  const [data, setData] = useState<EarningsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    analyticsService.fetchEarningsHistory(days)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch earnings history');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [days]);

  return { data, loading, error };
};

export const useReputationScore = () => {
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    analyticsService.fetchReputationScore()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch reputation score');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
};

export const useEngagementMetrics = () => {
  const [data, setData] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    analyticsService.fetchEngagementMetrics()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch engagement metrics');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
};
