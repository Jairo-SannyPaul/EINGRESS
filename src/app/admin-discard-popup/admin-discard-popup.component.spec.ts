import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDiscardPopupComponent } from './admin-discard-popup.component';

describe('AdminDiscardPopupComponent', () => {
  let component: AdminDiscardPopupComponent;
  let fixture: ComponentFixture<AdminDiscardPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDiscardPopupComponent]
    });
    fixture = TestBed.createComponent(AdminDiscardPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
