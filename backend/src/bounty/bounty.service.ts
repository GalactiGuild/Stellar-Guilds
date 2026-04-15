import { Injectable } from '@nestjs/common';
import { CreateBountyDto, UpdateBountyDto, SubmitBountyDto } from './dto';

@Injectable()
export class BountyService {
  create(createBountyDto: CreateBountyDto) {
    return 'This action adds a new bounty';
  }

  findAll() {
    return `This action returns all bounties`;
  }

  findOne(id: string) {
    return `This action returns a #${id} bounty`;
  }

  update(id: string, updateBountyDto: UpdateBountyDto) {
    return `This action updates a #${id} bounty`;
  }

  remove(id: string) {
    return `This action removes a #${id} bounty`;
  }

  submitWork(id: string, submitBountyDto: SubmitBountyDto) {
    return `This action submits work for bounty #${id}`;
  }
}