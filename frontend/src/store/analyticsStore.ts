import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WidgetLayout } from '../features/analytics/types';

interface AnalyticsState {
  layouts: WidgetLayout[];
  updateLayout: (id: string, updates: Partial<WidgetLayout>) => void;
  reorderLayouts: (newLayouts: WidgetLayout[]) => void;
}

const defaultLayouts: WidgetLayout[] = [
  { id: 'activity', visible: true, order: 0 },
  { id: 'earnings', visible: true, order: 1 },
  { id: 'reputation', visible: true, order: 2 },
  { id: 'engagement', visible: true, order: 3 },
];

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      layouts: defaultLayouts,
      updateLayout: (id, updates) =>
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === id ? { ...layout, ...updates } : layout
          ),
        })),
      reorderLayouts: (newLayouts) => set({ layouts: newLayouts }),
    }),
    {
      name: 'analytics-dashboard-layouts',
    }
  )
);
