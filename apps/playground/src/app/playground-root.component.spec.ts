import { TestBed } from '@angular/core/testing';
import { PlaygroundRootComponent } from './playground-root.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [PlaygroundRootComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(PlaygroundRootComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'playground'`, () => {
    const fixture = TestBed.createComponent(PlaygroundRootComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('playground');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(PlaygroundRootComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome playground'
    );
  });
});
