import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndExamComponent } from './end-exam.component';

describe('EndExamComponent', () => {
  let component: EndExamComponent;
  let fixture: ComponentFixture<EndExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
