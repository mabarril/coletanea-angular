import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wheel } from './wheel';

describe('Wheel', () => {
  let component: Wheel;
  let fixture: ComponentFixture<Wheel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wheel]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Wheel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('rotation', 0);
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('isSpinning', false);
    fixture.componentRef.setInput('spinDuration', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
