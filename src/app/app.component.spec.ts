import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

import { TestScheduler } from 'rxjs/testing';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

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
      scheduler.run(({ hot, expectObservable }) => {
        const component = new AppComponent();
        component.COUNTDOWN_TIMER_SECONDS = 5;
        component.INTERVAL = 2;

        const expectedMarble1 = '2ms a 1ms b 1ms c 1ms d';
        const expectedValues = { a: 2, b: 3, c: 4, d: 5 };

        const start$: Observable<any> = hot('s----|');
        const resume$: Observable<any> = hot('-----|');
        const pause$: Observable<any> = hot('-----|');
        const cancel$: Observable<any> = hot('-----|');

        const result$ = component
          .getTimerCount(start$, resume$, pause$, cancel$)
          .pipe(
            tap(v => {
              console.log('emitted value: ', v);
            })
          );

        const unsub = '--------- !';
        expectObservable(result$, unsub).toBe(expectedMarble1, expectedValues);
      });
    });

    it('should stop emitting values when cancel$ emit', () => {
      scheduler.run(({ hot, expectObservable }) => {
        const component = new AppComponent();
        component.COUNTDOWN_TIMER_SECONDS = 5;
        component.INTERVAL = 2;
        const expectedMarble1 = '2ms a';
        const expectedValues = { a: 2 };

        const start$: Observable<any> = hot('s----|');
        const resume$: Observable<any> = hot('-----|');
        const pause$: Observable<any> = hot('-----|');
        const cancel$: Observable<any> = hot('---c--|');

        const result$ = component
          .getTimerCount(start$, resume$, pause$, cancel$)
          .pipe(
            tap(value => {
              console.log('emitted value: ', value);
            })
          );

        const unsub = '----- !';
        expectObservable(result$, unsub).toBe(expectedMarble1, expectedValues);
      });
    });

    it('should stop emitting values on pause$ and should return to emit values on resume$', () => {
      scheduler.run(({ hot, expectObservable }) => {
        const component = new AppComponent();
        component.COUNTDOWN_TIMER_SECONDS = 5;
        component.INTERVAL = 2;

        const expectedMarble1 = '2ms a 3ms b 1ms (c|)';
        const expectedValues = { a: 2, b: 3, c: 4 };

        const start$: Observable<any> = hot('s----|');
        const resume$: Observable<any> = hot('----r|');
        const pause$: Observable<any> = hot('---p-|');
        const cancel$: Observable<any> = hot('-----|');

        const result$ = component
          .getTimerCount(start$, resume$, pause$, cancel$)
          .pipe(
            tap(v => {
              console.log('emitted value: ', v);
            }),
            take(3)
          );

        expectObservable(result$).toBe(expectedMarble1, expectedValues);
      });
    });
  });
});
