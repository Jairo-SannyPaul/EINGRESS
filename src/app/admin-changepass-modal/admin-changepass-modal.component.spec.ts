import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminChangepassModalComponent } from './admin-changepass-modal.component';

describe('AdminChangepassModalComponent', () => {
  let component: AdminChangepassModalComponent;
  let fixture: ComponentFixture<AdminChangepassModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminChangepassModalComponent]
    });
    fixture = TestBed.createComponent(AdminChangepassModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
