import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDropdownComponent } from './custom-dropdown.component';

describe('CustomDropdownComponent', () => {
  let component: CustomDropdownComponent;
  let fixture: ComponentFixture<CustomDropdownComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomDropdownComponent]
    });
    fixture = TestBed.createComponent(CustomDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
