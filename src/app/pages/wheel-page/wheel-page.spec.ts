import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WheelPage } from './wheel-page';

describe('WheelPage', () => {
  let component: WheelPage;
  let fixture: ComponentFixture<WheelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelPage],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WheelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
