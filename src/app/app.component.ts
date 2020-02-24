import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { Observable, Subscription, interval, merge } from 'rxjs';
import {
  takeWhile,
  switchMap,
  map,
  takeUntil,
  repeat,
  tap
} from 'rxjs/operators';

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
  private _count = 1;

  private onStart = new EventEmitter<void>();
  private start$ = this.onStart.asObservable();

  private onCancel = new EventEmitter<void>();
  private cancel$ = this.onCancel.asObservable();

  private onResume = new EventEmitter<void>();
  private resume$ = this.onResume.asObservable();

  private onPause = new EventEmitter<void>();
  private pause$ = this.onPause.asObservable();

  private subscription = new Subscription();

  public COUNTDOWN_TIMER_SECONDS = 5;
  public INTERVAL = 1000;
  public text = 'Click start';
  public timerStatus: TimerStatus;

  public set count(value: number) {
    if (value === this.COUNTDOWN_TIMER_SECONDS) {
      setTimeout(() => this.cancel(), 1000);
    }
    this._count = value;
  }

  public get count() {
    return this._count;
  }

  public get startButtonText() {
    if (this.timerStatus === TimerStatus.Cancelled) {
      return 'Start';
    } else if (this.timerStatus === TimerStatus.Paused) {
      return 'Resume';
    } else if (this.timerStatus === TimerStatus.Running) {
      return 'Pause';
    }
  }

  constructor() {}

  ngOnInit(): void {
    this.subscription = this.getTimerCount(
      this.start$,
      this.resume$,
      this.pause$,
      this.cancel$
    ).subscribe(v => {
      console.log('value was emitted: ', v);
    });
    this.start();
  }

  getTimerCount(
    start$: Observable<void>,
    resume$: Observable<void>,
    pause$: Observable<void>,
    cancel$: Observable<void>
  ) {
    const stop$ = merge(cancel$, pause$).pipe(
      tap(v => {
        console.log('stop value: ', v);
      })
    );
    const trigger$ = merge(start$, resume$).pipe(
      tap(v => console.log('tigger value: ', v))
    );
    return trigger$.pipe(
      switchMap(() =>
        interval(this.INTERVAL).pipe(
          takeUntil(stop$),
          takeWhile(() => {
            console.log(
              `take while: ${this.count} <= ${this.COUNTDOWN_TIMER_SECONDS} -1`
            );
            return this.count <= this.COUNTDOWN_TIMER_SECONDS - 1;
          }),

          map(() => {
            this.count = this.count + 1;
            return this.count;
          })
        )
      ),
      repeat()
    );
  }

  onClick() {
    switch (this.timerStatus) {
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
    this.timerStatus = TimerStatus.Cancelled;
    this.onCancel.emit();
    this.count = 1;
  }

  pause() {
    this.timerStatus = TimerStatus.Paused;
    this.onPause.emit();
  }

  resume() {
    this.timerStatus = TimerStatus.Running;
    this.onResume.emit();
  }

  start() {
    this.timerStatus = TimerStatus.Running;
    this.onStart.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
