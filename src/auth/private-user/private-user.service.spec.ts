import { Test, TestingModule } from '@nestjs/testing';
import { PrivateUserService } from './private-user.service';

describe('PrivateUserService', () => {
  let service: PrivateUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrivateUserService],
    }).compile();

    service = module.get<PrivateUserService>(PrivateUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
