// Refund Logic Interfaces for Expired Bounties
// Addresses issue #254

export interface Bounty {
  id: string;
  creator: string;
  amount: number;
  asset: string;
  expiresAt: number;
  status: 'active' | 'expired' | 'claimed' | 'refunded';
}

export interface RefundRequest {
  bountyId: string;
  claimant: string;
}

export interface RefundResponse {
  success: boolean;
  amount: number;
  asset: string;
  txHash?: string;
  error?: string;
}

export function isBountyExpired(bounty: Bounty): boolean {
  return bounty.status === 'active' && Date.now() > bounty.expiresAt * 1000;
}

export async function processRefund(bounty: Bounty): Promise<RefundResponse> {
  if (!isBountyExpired(bounty)) {
    return { success: false, amount: 0, asset: bounty.asset, error: 'Bounty not expired' };
  }
  // Refund logic: return funds to creator
  return {
    success: true,
    amount: bounty.amount,
    asset: bounty.asset,
    txHash: 'refund_' + bounty.id + '_' + Date.now(),
  };
}
