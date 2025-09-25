import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemInformationsComponent } from './system-informations.component';

describe('SystemInformationsComponent', () => {
  let component: SystemInformationsComponent;
  let fixture: ComponentFixture<SystemInformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemInformationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
