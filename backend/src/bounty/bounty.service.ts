import { Injectable } from '@nestjs/common';
import { Bounty } from './bounty.entity';

@Injectable()
export class BountyService {
  async raiseDispute(bountyId: number): Promise<void> {
    const bounty = await Bounty.findOne(bountyId);
    if (!bounty) throw new Error('Bounty not found');
    bounty.is_disputed = true;
    await bounty.save();
  }

  async resolveDispute(bountyId: number, resolutionPlan: any): Promise<void> {
    const bounty = await Bounty.findOne(bountyId);
    if (!bounty) throw new Error('Bounty not found');
    // Implement resolution logic
    bounty.is_disputed = false;
    await bounty.save();
  }
}