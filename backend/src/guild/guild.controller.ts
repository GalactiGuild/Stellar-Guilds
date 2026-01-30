import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GuildService } from './guild.service';
import { CreateGuildDto } from './dto/create-guild.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ApproveInviteDto } from './dto/approve-invite.dto';
import { SearchGuildDto } from './dto/search-guild.dto';

@Controller('guilds')
export class GuildController {
  constructor(private guildService: GuildService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateGuildDto, @Request() req: any) {
    return this.guildService.createGuild(dto, req.user.userId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.guildService.getGuild(id);
  }

  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.guildService.getBySlug(slug);
  }

  @Get()
  async search(@Query() query: SearchGuildDto) {
    return this.guildService.searchGuilds(query.q, query.page, query.size);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGuildDto, @Request() req: any) {
    return this.guildService.updateGuild(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.guildService.deleteGuild(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/invite')
  async invite(@Param('id') id: string, @Body() dto: InviteMemberDto, @Request() req: any) {
    return this.guildService.inviteMember(id, dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() dto: ApproveInviteDto, @Request() req: any) {
    if (dto.token) return this.guildService.approveInviteByToken(id, dto.token, req.user.userId);
    // If no token provided, try to approve membership for requester
    return this.guildService.approveInviteByToken(id, '', req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async join(@Param('id') id: string, @Request() req: any) {
    return this.guildService.joinGuild(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  async leave(@Param('id') id: string, @Request() req: any) {
    return this.guildService.leaveGuild(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/assign-role/:userId')
  async assignRole(@Param('id') id: string, @Param('userId') userId: string, @Body() body: any, @Request() req: any) {
    return this.guildService.assignRole(id, userId, body.role, req.user.userId);
  }
}
