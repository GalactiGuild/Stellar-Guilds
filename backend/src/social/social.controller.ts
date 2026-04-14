import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('feed/:userId')
  async getFeed(@Param('userId') userId: string) {
    return this.socialService.getFeedForUser(userId);
  }

  /** Follow a user */
  @UseGuards(JwtAuthGuard)
  @Post('follow/:followingId')
  async followUser(
    @Param('followingId') followingId: string,
    @Request() req: any,
  ) {
    return this.socialService.followUser(req.user.userId, followingId);
  }

  /** Unfollow a user */
  @UseGuards(JwtAuthGuard)
  @Delete('follow/:followingId')
  async unfollowUser(
    @Param('followingId') followingId: string,
    @Request() req: any,
  ) {
    return this.socialService.unfollowUser(req.user.userId, followingId);
  }

  /** Check if current user follows target */
  @UseGuards(JwtAuthGuard)
  @Get('follows/:followingId')
  async isFollowing(
    @Param('followingId') followingId: string,
    @Request() req: any,
  ) {
    const following = await this.socialService.isFollowing(
      req.user.userId,
      followingId,
    );
    return { following };
  }

  /** Get followers list */
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.socialService.getFollowers(
      userId,
      Number(page) || 0,
      Number(size) || 20,
    );
  }

  /** Get following list */
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.socialService.getFollowing(
      userId,
      Number(page) || 0,
      Number(size) || 20,
    );
  }
}
