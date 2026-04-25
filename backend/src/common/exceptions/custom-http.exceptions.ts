import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { StellarErrorCode } from '../errors/stellar-error-code.enum';

type ExceptionOptions = {
  errorCode?: StellarErrorCode;
};

export class AppUnauthorizedException extends UnauthorizedException {
  readonly errorCode?: StellarErrorCode;

  constructor(message?: string, options?: ExceptionOptions) {
    super(message);
    this.errorCode = options?.errorCode ?? StellarErrorCode.UNAUTHORIZED;
  }
}

export class AppBadRequestException extends BadRequestException {
  readonly errorCode?: StellarErrorCode;

  constructor(message?: string, options?: ExceptionOptions) {
    super(message);
    this.errorCode = options?.errorCode ?? StellarErrorCode.BAD_REQUEST;
  }
}

export class AppForbiddenException extends ForbiddenException {
  readonly errorCode?: StellarErrorCode;

  constructor(message?: string, options?: ExceptionOptions) {
    super(message);
    this.errorCode = options?.errorCode ?? StellarErrorCode.FORBIDDEN;
  }
}

export class AppNotFoundException extends NotFoundException {
  readonly errorCode?: StellarErrorCode;

  constructor(message?: string, options?: ExceptionOptions) {
    super(message);
    this.errorCode = options?.errorCode ?? StellarErrorCode.NOT_FOUND;
  }
}

export class AppConflictException extends ConflictException {
  readonly errorCode?: StellarErrorCode;

  constructor(message?: string, options?: ExceptionOptions) {
    super(message);
    this.errorCode = options?.errorCode ?? StellarErrorCode.CONFLICT;
  }
}
