import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterAComponent } from './counter-a.component';

describe('CounterAComponent', () => {
  let component: CounterAComponent;
  let fixture: ComponentFixture<CounterAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterAComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CounterAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
