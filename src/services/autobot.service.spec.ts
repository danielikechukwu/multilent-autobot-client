import { TestBed } from '@angular/core/testing';

import { AutobotService } from './autobot.service';

describe('AutobotService', () => {
  let service: AutobotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutobotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
