import {TestBed, async} from '@angular/core/testing';
import {AppComponent} from './app.component';

import {TestScheduler} from 'rxjs/testing';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';

describe('AppComponent', () => {
  let scheduler: TestScheduler;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent]
    }).compileComponents();

    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  }));

  describe('getTimerCount method', () => {
    it('should emit the incremented count value every interval on start$', () => {
      scheduler.run(({hot, expectObservable}) => {
        const component = new AppComponent();
        component.INTERVAL = 2;

        const expectedMarble1 = '2ms a 1ms b 1ms c 1ms d';
        const expectedValues = {a: 1, b: 2, c: 3, d: 4};

        const start$: Observable<void> = hot('s----|');
        const resume$: Observable<void> = hot('-----|');
        const pause$: Observable<void> = hot('-----|');
        const cancel$: Observable<void> = hot('-----|');

        const result$ = component.getTimerCount(start$, resume$, pause$, cancel$);

        const unsub = '--------- !';
        expectObservable(result$, unsub).toBe(expectedMarble1, expectedValues);
      });
    });

    it('should stop emitting values when cancel$ emit', () => {
      scheduler.run(({hot, expectObservable}) => {
        const component = new AppComponent();
        component.INTERVAL = 2;
        const expectedMarble1 = '2ms a';
        const expectedValues = {a: 1};

        const start$: Observable<void> = hot('s----|');
        const resume$: Observable<void> = hot('-----|');
        const pause$: Observable<void> = hot('-----|');
        const cancel$: Observable<void> = hot('---c--|');

        const result$ = component.getTimerCount(start$, resume$, pause$, cancel$);

        const unsub = '----- !';
        expectObservable(result$, unsub).toBe(expectedMarble1, expectedValues);
      });
    });

    it('should stop emitting values on pause$ and should return to emit values on resume$', () => {
      scheduler.run(({hot, expectObservable}) => {
        const component = new AppComponent();
        component.INTERVAL = 2;

        const expectedMarble1 = '2ms a 3ms b 1ms (c|)';
        const expectedValues = {a: 1, b: 2, c: 3};

        const start$: Observable<void> = hot('s----|');
        const resume$: Observable<void> = hot('----r|');
        const pause$: Observable<void> = hot('---p-|');
        const cancel$: Observable<void> = hot('-----|');

        const result$ = component.getTimerCount(start$, resume$, pause$, cancel$).pipe(take(3));

        expectObservable(result$).toBe(expectedMarble1, expectedValues);
      });
    });
  });
});
