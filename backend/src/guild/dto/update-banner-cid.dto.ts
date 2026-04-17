import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBannerCidDto {
  @ApiProperty({
    description: 'CID (Content Identifier) for the banner image',
    example: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
  })
  @IsString()
  @IsNotEmpty()
  bannerCid: string;
}
