import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWordsComponent } from './list-words.component';

describe('ListWordsComponent', () => {
  let component: ListWordsComponent;
  let fixture: ComponentFixture<ListWordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListWordsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListWordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
