import { TestBed } from '@angular/core/testing';

import { HeaderLabelService } from './header-label.service';

describe('HeaderLabelService', () => {
  let service: HeaderLabelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderLabelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
