import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelControls } from './wheel-controls';

describe('WheelControls', () => {
  let component: WheelControls;
  let fixture: ComponentFixture<WheelControls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelControls]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelControls);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
