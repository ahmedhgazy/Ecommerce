import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    concatMap,
    defer,
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

    //* Using of and emitting a null value to trigger the loadingOn() method
    // showLoadingUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    //     return of(null).pipe(
    //         tap(() => {
    //             this.loadingOn(); // action taken before the observable is completed
    //         }),
    //         concatMap(() => obs$),
    //         finalize(() => this.loadingOf()) // action taken after the observable is completed or unsubscribe from the observable
    //     );
    // }

    //* Using defer to defer the execution of the observable until the subscription
    showLoadingUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
        return defer(() => {
            this.loadingOn(); // Runs synchronously on subscription
            return obs$.pipe(finalize(() => this.loadingOf()));
        });
    }

    loadingOn() {
        this.loadingSubject.next(true);
    }

    loadingOf() {
        this.loadingSubject.next(false);
    }
}
