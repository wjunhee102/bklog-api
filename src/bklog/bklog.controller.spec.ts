import { Test, TestingModule } from '@nestjs/testing';
import { BklogController } from './bklog.controller';
import * as request from 'supertest';
import { Post, Req, Res, Body, Get, Param, Query } from '@nestjs/common';

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
