import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRCodePage } from './qrcode-page';

describe('QRCodePage', () => {
  let component: QRCodePage;
  let fixture: ComponentFixture<QRCodePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QRCodePage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QRCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
