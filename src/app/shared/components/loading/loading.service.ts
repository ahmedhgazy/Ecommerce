import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    concatMap,
    finalize,
    Observable,
    of,
    tap,
} from 'rxjs';

@Injectable()
export class LoadingService {
    // create a subject to emit the value of loading !
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$: Observable<boolean> = this.loadingSubject.asObservable();
    constructor() {}

    showLoadingUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
        return of(null).pipe(
            tap(() => {
                this.loadingOn();
            }),
            concatMap(() => obs$),
            finalize(() => this.loadingOf())
        );
    }

    loadingOn() {
        this.loadingSubject.next(true);
    }

    loadingOf() {
        this.loadingSubject.next(false);
    }
}
