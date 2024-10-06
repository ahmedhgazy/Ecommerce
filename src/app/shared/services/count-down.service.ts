// * not needed

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { map, takeWhile, tap } from 'rxjs/operators';

export interface CountdownTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

@Injectable({
    providedIn: 'root',
})
export class CountdownService implements OnDestroy {
    private countdownSubject = new BehaviorSubject<CountdownTime>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    countdown$: Observable<CountdownTime> =
        this.countdownSubject.asObservable();
    private timerSubscription: Subscription | null = null;
    private endDate: Date | null = null;

    startCountdown(endDate: Date) {
        this.stopCountdown();

        this.endDate = endDate;

        this.timerSubscription = timer(0, 1000)
            .pipe(
                map(() => this.calculateTimeLeft()),
                takeWhile((timeLeft) => timeLeft > 0, true),
                tap((timeLeft) => {
                    if (timeLeft <= 0) {
                        this.countdownSubject.next({
                            days: 0,
                            hours: 0,
                            minutes: 0,
                            seconds: 0,
                        });
                        this.stopCountdown();
                    } else {
                        const days = Math.floor(
                            timeLeft / (1000 * 60 * 60 * 24)
                        );
                        const hours = Math.floor(
                            (timeLeft % (1000 * 60 * 60 * 24)) /
                                (1000 * 60 * 60)
                        );
                        const minutes = Math.floor(
                            (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        const seconds = Math.floor(
                            (timeLeft % (1000 * 60)) / 1000
                        );

                        this.countdownSubject.next({
                            days,
                            hours,
                            minutes,
                            seconds,
                        });
                    }
                })
            )
            .subscribe();
    }

    private calculateTimeLeft(): number {
        if (!this.endDate) return 0;
        return Math.max(0, this.endDate.getTime() - new Date().getTime());
    }

    stopCountdown() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
            this.timerSubscription = null;
        }
        this.endDate = null;
    }

    ngOnDestroy() {
        this.stopCountdown();
    }
}
