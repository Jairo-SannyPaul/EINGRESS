import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserSubmitPopupComponent } from './add-user-submit-popup.component';

describe('AddUserSubmitPopupComponent', () => {
  let component: AddUserSubmitPopupComponent;
  let fixture: ComponentFixture<AddUserSubmitPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddUserSubmitPopupComponent]
    });
    fixture = TestBed.createComponent(AddUserSubmitPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
