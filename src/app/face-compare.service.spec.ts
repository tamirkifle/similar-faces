import { TestBed } from '@angular/core/testing';

import { FaceCompareService } from './face-compare.service';

describe('FaceCompareService', () => {
  let service: FaceCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaceCompareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
