import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnbotComponent } from './learnbot.component';

describe('LearnbotComponent', () => {
  let component: LearnbotComponent;
  let fixture: ComponentFixture<LearnbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearnbotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearnbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
