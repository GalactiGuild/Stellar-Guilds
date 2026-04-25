import { Controller, Get } from '@nestjs/common';
import { AppUnauthorizedException } from '../exceptions/custom-http.exceptions';
import { StellarErrorCode } from '../errors/stellar-error-code.enum';

@Controller('test/error-codes')
export class ErrorCodeTestController {
  @Get('unauthorized')
  throwUnauthorized() {
    throw new AppUnauthorizedException('Token is invalid or expired', {
      errorCode: StellarErrorCode.UNAUTHORIZED,
    });
  }
}
