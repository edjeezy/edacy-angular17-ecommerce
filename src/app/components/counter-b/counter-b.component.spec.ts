import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterBComponent } from './counter-b.component';

describe('CounterBComponent', () => {
  let component: CounterBComponent;
  let fixture: ComponentFixture<CounterBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterBComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CounterBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
