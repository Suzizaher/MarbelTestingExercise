import {Component, OnInit, OnDestroy} from '@angular/core';
import {Observable, Subscription, interval, merge, Subject} from 'rxjs';
import {switchMap, map, takeUntil} from 'rxjs/operators';

enum TimerStatus {
  Running = 'running',
  Paused = 'paused',
  Cancelled = 'canceled'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private onStart = new Subject<void>();
  private start$ = this.onStart.asObservable();

  private onCancel = new Subject<void>();
  private cancel$ = this.onCancel.asObservable();

  private onResume = new Subject<void>();
  private resume$ = this.onResume.asObservable();

  private onPause = new Subject<void>();
  private pause$ = this.onPause.asObservable();

  private subscription = new Subscription();

  public INTERVAL = 1000;
  public text = 'Click start';
  public count = 0;
  public currentTimerStatus: TimerStatus;

  public get startButtonText() {
    switch (this.currentTimerStatus) {
      case TimerStatus.Cancelled: {
        return 'Start';
      }
      case TimerStatus.Paused: {
        return 'Resume';
      }
      case TimerStatus.Running: {
        return 'Pause';
      }
      default: {
        return;
      }
    }
  }

  get timerStatus() {
    return TimerStatus;
  }

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.getTimerCount(
      this.start$,
      this.resume$,
      this.pause$,
      this.cancel$
    ).subscribe();
    this.start();
  }

  getTimerCount(
    start$: Observable<void>,
    resume$: Observable<void>,
    pause$: Observable<void>,
    cancel$: Observable<void>
  ): Observable<number> {
    const trigger$ = merge(start$, resume$);
    const stop$ = merge(cancel$, pause$);

    const count$ = interval(this.INTERVAL).pipe(
      takeUntil(stop$),
      map(() => {
        this.count++;
        return this.count;
      })
    );

    const result$ = trigger$.pipe(switchMap(() => count$));
    return result$;
  }

  onClick() {
    switch (this.currentTimerStatus) {
      case TimerStatus.Running: {
        this.pause();
        break;
      }
      case TimerStatus.Cancelled: {
        this.start();
        break;
      }
      case TimerStatus.Paused: {
        this.resume();
        break;
      }
      default: {
        return;
      }
    }
  }

  cancel() {
    this.currentTimerStatus = TimerStatus.Cancelled;
    this.onCancel.next();
    this.count = 0;
  }

  pause() {
    this.currentTimerStatus = TimerStatus.Paused;
    this.onPause.next();
  }

  resume() {
    this.currentTimerStatus = TimerStatus.Running;
    this.onResume.next();
  }

  start() {
    this.currentTimerStatus = TimerStatus.Running;
    this.onStart.next();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
