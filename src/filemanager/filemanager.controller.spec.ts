import { Test, TestingModule } from '@nestjs/testing';
import { FilemanagerController } from './filemanager.controller';

describe('FilemanagerController', () => {
  let controller: FilemanagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilemanagerController],
    }).compile();

    controller = module.get<FilemanagerController>(FilemanagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
