import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBellComponent } from './header-bell.component';

describe('HeaderBellComponent', () => {
  let component: HeaderBellComponent;
  let fixture: ComponentFixture<HeaderBellComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderBellComponent]
    });
    fixture = TestBed.createComponent(HeaderBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
