import { TestBed } from '@angular/core/testing';

import { UserWordService } from './user-word.service';

describe('UserWordService', () => {
  let service: UserWordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserWordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
