import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum OnboardingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Injectable()
export class UserOnboardingStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getOnboardingStatus(userId: string): Promise<{ userId: string; status: OnboardingStatus; completedSteps: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, onboardingStatus: true, onboardingSteps: true },
    });
    return {
      userId,
      status: (user?.onboardingStatus as OnboardingStatus) ?? OnboardingStatus.PENDING,
      completedSteps: (user?.onboardingSteps as string[]) ?? [],
    };
  }

  async updateOnboardingStatus(userId: string, step: string): Promise<{ status: OnboardingStatus }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingSteps: true },
    });
    const completedSteps: string[] = [...((user?.onboardingSteps as string[]) ?? [])];
    if (!completedSteps.includes(step)) completedSteps.push(step);

    const allSteps = ['profile', 'wallet', 'guild', 'kyc'];
    const status = completedSteps.length >= allSteps.length
      ? OnboardingStatus.COMPLETED
      : completedSteps.length > 0
        ? OnboardingStatus.IN_PROGRESS
        : OnboardingStatus.PENDING;

    await this.prisma.user.update({
      where: { id: userId },
      data: { onboardingStatus: status, onboardingSteps: completedSteps },
    });
    return { status };
  }
}
