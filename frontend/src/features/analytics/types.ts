export interface ActivityDataPoint {
  date: string;
  contributions: number;
  proposals: number;
  votes: number;
}

export interface EarningsDataPoint {
  date: string;
  amount: number;
  source: string; // e.g., 'Bounty', 'Grant', 'Tip'
}

export interface ReputationData {
  currentScore: number;
  level: string;
  nextLevelScore: number;
  percentToNextLevel: number;
  history: { date: string; score: number }[];
}

export interface EngagementMetrics {
  userMetrics: {
    forumsPosted: number;
    bountiesCompleted: number;
    guildsJoined: number;
    averageSessionTimeMin: number;
  };
  platformBenchmarks: {
    forumsPosted: number;
    bountiesCompleted: number;
    guildsJoined: number;
    averageSessionTimeMin: number;
  };
}

// Widget Layout Types
export interface WidgetLayout {
  id: string;
  visible: boolean;
  order: number;
}
