import { Test, TestingModule } from '@nestjs/testing';
import { BklogService } from './bklog.service';

describe('BklogService', () => {
  let service: BklogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BklogService],
    }).compile();

    service = module.get<BklogService>(BklogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
