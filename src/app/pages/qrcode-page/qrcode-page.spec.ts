import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcodePage } from './qrcode-page';

describe('QrcodePage', () => {
  let component: QrcodePage;
  let fixture: ComponentFixture<QrcodePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrcodePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrcodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
