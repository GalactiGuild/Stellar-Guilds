import { create } from "zustand";
import { toast } from "sonner";
import { MOCK_BOUNTIES } from "@/lib/mocks/bounties";
import { Bounty, BountyStatus } from "@/features/bounties/types";

interface BountyStore {
  bounties: Bounty[];
  acceptSubmission: (bountyId: string) => Promise<void>;
  submitBounty: (bountyId: string) => Promise<void>;
  resetBounties: () => void;
}

const NETWORK_DELAY_MS = 3000;
const FAILURE_RATE = 0.2;

const waitForMockStellarConfirmation = () =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error("Mock Stellar transaction failed"));
        return;
      }

      resolve();
    }, NETWORK_DELAY_MS);
  });

const initialBounties = () => MOCK_BOUNTIES.map((bounty) => ({ ...bounty }));

export const useBountyStore = create<BountyStore>((set, get) => {
  const applyOptimisticStatus = async (
    bountyId: string,
    nextStatus: BountyStatus,
    successMessage: string,
  ) => {
    const current = get().bounties.find((bounty) => bounty.id === bountyId);

    if (!current) {
      toast.error("Bounty not found");
      return;
    }

    const previousStatus = current.status;

    set((state) => ({
      bounties: state.bounties.map((bounty) =>
        bounty.id === bountyId
          ? {
              ...bounty,
              status: nextStatus,
              optimisticStatus: nextStatus,
              isPending: true,
              error: undefined,
            }
          : bounty,
      ),
    }));

    try {
      await waitForMockStellarConfirmation();

      set((state) => ({
        bounties: state.bounties.map((bounty) =>
          bounty.id === bountyId
            ? {
                ...bounty,
                status: nextStatus,
                optimisticStatus: undefined,
                isPending: false,
                error: undefined,
              }
            : bounty,
        ),
      }));

      toast.success(successMessage);
    } catch {
      set((state) => ({
        bounties: state.bounties.map((bounty) =>
          bounty.id === bountyId
            ? {
                ...bounty,
                status: previousStatus,
                optimisticStatus: undefined,
                isPending: false,
                error: "The mock Stellar transaction failed, so the status was rolled back.",
              }
            : bounty,
        ),
      }));

      toast.error("Mock Stellar confirmation failed", {
        description: "Bounty status was restored to its previous state.",
      });
    }
  };

  return {
    bounties: initialBounties(),
    acceptSubmission: (bountyId) =>
      applyOptimisticStatus(
        bountyId,
        "Claimed",
        "Submission accepted after mock Stellar confirmation.",
      ),
    submitBounty: (bountyId) =>
      applyOptimisticStatus(
        bountyId,
        "Under Review",
        "Bounty submission moved under review.",
      ),
    resetBounties: () => set({ bounties: initialBounties() }),
  };
});
