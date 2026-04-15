import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { CreateBountyDto, UpdateBountyDto, SubmitBountyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('bounties')
@UseGuards(JwtAuthGuard)
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.GUILD_OWNER)
  create(@Body() createBountyDto: CreateBountyDto) {
    return this.bountyService.create(createBountyDto);
  }

  @Get()
  findAll() {
    return this.bountyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bountyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.GUILD_OWNER)
  update(@Param('id') id: string, @Body() updateBountyDto: UpdateBountyDto) {
    return this.bountyService.update(id, updateBountyDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.ADMIN, Role.GUILD_OWNER)
  remove(@Param('id') id: string) {
    return this.bountyService.remove(id);
  }

  @Post(':id/submit')
  submitWork(@Param('id') id: string, @Body() submitBountyDto: SubmitBountyDto) {
    return this.bountyService.submitWork(id, submitBountyDto);
  }
}