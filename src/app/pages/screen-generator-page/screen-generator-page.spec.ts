import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenGeneratorPage } from './screen-generator-page';

describe('ScreenGeneratorPage', () => {
  let component: ScreenGeneratorPage;
  let fixture: ComponentFixture<ScreenGeneratorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenGeneratorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenGeneratorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
