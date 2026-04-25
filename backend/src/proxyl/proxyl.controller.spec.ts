import { Test, TestingModule } from '@nestjs/testing';
import { ImageProxyController } from './proxyl.controller';
import { ProxylService } from './proxyl.service';
import { ImageProxyService } from './image-proxyl-service';

describe('ImageProxyController', () => {
  let controller: ImageProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageProxyController],
      providers: [
        ProxylService,
        {
          provide: ImageProxyService,
          useValue: {
            validateLogoUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImageProxyController>(ImageProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
