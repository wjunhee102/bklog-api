import { Test, TestingModule } from '@nestjs/testing';
import { BklogController } from './bklog.controller';

describe('BklogController', () => {
  let controller: BklogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BklogController],
    }).compile();

    controller = module.get<BklogController>(BklogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
