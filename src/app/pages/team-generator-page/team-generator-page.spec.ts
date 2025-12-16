import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamGeneratorPage } from './team-generator-page';

describe('TeamGeneratorPage', () => {
  let component: TeamGeneratorPage;
  let fixture: ComponentFixture<TeamGeneratorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamGeneratorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamGeneratorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
