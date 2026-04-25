import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { MembershipStatus, GuildRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, guildId: string) {
    const existing = await this.prisma.guildMembership.findFirst({
      where: { 
        userId, 
        guildId, 
        status: { in: [MembershipStatus.PENDING, MembershipStatus.MODERATION_PENDING] }
      },
    });
    if (existing) throw new ConflictException('Application already exists');

    return this.prisma.guildMembership.create({
      data: { userId, guildId, status: MembershipStatus.MODERATION_PENDING, role: GuildRole.MEMBER },
    });
  }

  async updateStatus(
    applicationId: string,
    status: MembershipStatus,
    adminId: string,
  ) {
    // Mocked admin check
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Admins only');

    const application = await this.prisma.guildMembership.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== MembershipStatus.PENDING)
      throw new BadRequestException('Only PENDING applications can be updated');
    if (status === MembershipStatus.PENDING)
      throw new BadRequestException('Cannot transition back to PENDING');

    return this.prisma.guildMembership.update({
      where: { id: applicationId },
      data: {
        status,
        ...(status === MembershipStatus.APPROVED ? { joinedAt: new Date() } : {}),
      },
    });
  }

  async getModerationQueue(guildId: string, adminId: string) {
    // High-level admin check (OWNER or system ADMIN)
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['OWNER', 'ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('High-level admins only');
    }

    return this.prisma.guildMembership.findMany({
      where: { 
        guildId, 
        status: MembershipStatus.MODERATION_PENDING 
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
            createdAt: true,
            role: true,
            xp: true,
            totalViews: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async moveToPending(applicationId: string, adminId: string) {
    // High-level admin check (OWNER or system ADMIN)
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || !['OWNER', 'ADMIN'].includes(admin.role)) {
      throw new ForbiddenException('High-level admins only');
    }

    const application = await this.prisma.guildMembership.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status !== MembershipStatus.MODERATION_PENDING)
      throw new BadRequestException('Only MODERATION_PENDING applications can be moved to PENDING');

    return this.prisma.guildMembership.update({
      where: { id: applicationId },
      data: { status: MembershipStatus.PENDING }
    });
  }
}
