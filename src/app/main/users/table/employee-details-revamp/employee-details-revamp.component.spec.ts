import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailsRevampComponent } from './employee-details-revamp.component';

describe('EmployeeDetailsRevampComponent', () => {
  let component: EmployeeDetailsRevampComponent;
  let fixture: ComponentFixture<EmployeeDetailsRevampComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeDetailsRevampComponent]
    });
    fixture = TestBed.createComponent(EmployeeDetailsRevampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
