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
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('isSpinning', false);
    fixture.componentRef.setInput('activeCount', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
