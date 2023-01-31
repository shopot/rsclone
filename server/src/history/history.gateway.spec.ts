import { Test, TestingModule } from '@nestjs/testing';
import { HistoryGateway } from './history.gateway';

describe('HistoryGateway', () => {
  let gateway: HistoryGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryGateway],
    }).compile();

    gateway = module.get<HistoryGateway>(HistoryGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
