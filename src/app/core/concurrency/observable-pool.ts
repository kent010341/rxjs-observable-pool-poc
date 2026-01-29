import { inject, Injectable, InjectionToken } from "@angular/core";
import { Subject, Observable, mergeMap, defer, tap, catchError, EMPTY } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ObservablePool {

    private readonly config = inject(OBSERVABLE_POOL_CONFIG, { optional: true });

    private readonly queue$ = new Subject<Observable<unknown>>();

    constructor() {
        const size = this.config?.poolSize ?? 10;

        this.queue$
            .pipe(
                mergeMap(task$ => task$.pipe(
                    // pool-level error should not break the pool
                    catchError(() => EMPTY)
                ), size)
            )
            .subscribe();
    }

    run<T>(task$: Observable<T>): Observable<T> {
        return defer(() => {
            const proxy$ = new Subject<T>();

            this.queue$.next(
                task$.pipe(
                    tap({
                        next: v => proxy$.next(v),
                        error: e => proxy$.error(e),
                        complete: () => proxy$.complete()
                    })
                )
            );

            return proxy$.asObservable();
        });
    }
}

export interface ObservablePoolConfig {

    /**
     * Maximum number of concurrent running tasks.
     * Default: 10
     */
    readonly poolSize?: number;
}

export const OBSERVABLE_POOL_CONFIG =
    new InjectionToken<ObservablePoolConfig>('OBSERVABLE_POOL_CONFIG');
