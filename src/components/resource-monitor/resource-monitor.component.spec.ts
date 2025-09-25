import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceMonitorComponent } from './resource-monitor.component';

describe('ResourceMonitorComponent', () => {
  let component: ResourceMonitorComponent;
  let fixture: ComponentFixture<ResourceMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
