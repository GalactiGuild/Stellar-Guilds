import { create } from 'zustand';
import { MOCK_BOUNTIES } from '@/lib/mocks/bounties';
import { Bounty, BountyStatus } from '@/features/bounties/types';

type OptimisticBountyState = {
  bounties: Bounty[];
  pendingStatusById: Record<string, BountyStatus>;
  errorById: Record<string, string>;
  updateBountyStatus: (bountyId: string, nextStatus: BountyStatus) => Promise<void>;
  clearBountyError: (bountyId: string) => void;
};

const MOCK_CONFIRMATION_DELAY_MS = 3000;
const MOCK_FAILURE_RATE = 0.2;

export const useBountyStore = create<OptimisticBountyState>((set, get) => ({
  bounties: MOCK_BOUNTIES,
  pendingStatusById: {},
  errorById: {},

  updateBountyStatus: async (bountyId, nextStatus) => {
    const currentBounty = get().bounties.find((bounty) => bounty.id === bountyId);

    if (!currentBounty) {
      throw new Error('Bounty not found');
    }

    const previousStatus = currentBounty.status;

    set((state) => ({
      bounties: state.bounties.map((bounty) =>
        bounty.id === bountyId ? { ...bounty, status: nextStatus } : bounty,
      ),
      pendingStatusById: {
        ...state.pendingStatusById,
        [bountyId]: nextStatus,
      },
      errorById: Object.fromEntries(
        Object.entries(state.errorById).filter(([id]) => id !== bountyId),
      ),
    }));

    await new Promise((resolve) => setTimeout(resolve, MOCK_CONFIRMATION_DELAY_MS));

    const shouldRollback = Math.random() < MOCK_FAILURE_RATE;

    if (shouldRollback) {
      set((state) => ({
        bounties: state.bounties.map((bounty) =>
          bounty.id === bountyId ? { ...bounty, status: previousStatus } : bounty,
        ),
        pendingStatusById: Object.fromEntries(
          Object.entries(state.pendingStatusById).filter(([id]) => id !== bountyId),
        ),
        errorById: {
          ...state.errorById,
          [bountyId]: 'Mock Stellar confirmation failed. Status was rolled back.',
        },
      }));
      throw new Error('Mock Stellar confirmation failed. Status was rolled back.');
    }

    set((state) => ({
      pendingStatusById: Object.fromEntries(
        Object.entries(state.pendingStatusById).filter(([id]) => id !== bountyId),
      ),
    }));
  },

  clearBountyError: (bountyId) => {
    set((state) => ({
      errorById: Object.fromEntries(
        Object.entries(state.errorById).filter(([id]) => id !== bountyId),
      ),
    }));
  },
}));
