import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortenerPage } from './shortener-page';

describe('ShortenerPage', () => {
  let component: ShortenerPage;
  let fixture: ComponentFixture<ShortenerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortenerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortenerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
