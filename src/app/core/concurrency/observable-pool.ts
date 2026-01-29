import { inject, Injectable, InjectionToken } from "@angular/core";
import { Subject, Observable, mergeMap, defer, tap, catchError, EMPTY } from "rxjs";

/**
 * Manages a pool of concurrent observable-based tasks.
 * It ensures that the number of simultaneously running tasks does not exceed a specified limit (`poolSize`).
 * Tasks are queued and executed as soon as a slot in the pool becomes available.
 * 
 * The pool size can be configured by providing a value for the `OBSERVABLE_POOL_CONFIG` injection token
 * in a component or module's providers.
 *
 * @example
 * ```typescript
 * @Component({
 *   // ...
 *   providers: [
 *     {
 *       provide: OBSERVABLE_POOL_CONFIG,
 *       useValue: { poolSize: 5 }
 *     },
 *     ObservablePool
 *   ]
 * })
 * export class MyComponent {
 *   // ...
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ObservablePool {

    /** The configuration for the observable pool. */
    private readonly config = inject(OBSERVABLE_POOL_CONFIG, { optional: true });

    /** A subject that acts as the queue for incoming tasks. */
    private readonly queue$ = new Subject<Observable<unknown>>();

    constructor() {
        const size = this.config?.poolSize ?? 10;

        this.queue$
            .pipe(
                // Use mergeMap with a concurrency limit to control the number of active subscriptions.
                mergeMap(task$ => task$.pipe(
                    // Errors within a task should not break the entire pool.
                    catchError(() => EMPTY)
                ), size)
            )
            .subscribe();
    }

    /**
     * Adds a new task to the execution queue.
     * The task will only start when the returned observable is subscribed to.
     * 
     * @param task$ The observable-based task to run.
     * @returns An observable that mirrors the original task's emissions (next, error, complete).
     */
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

/**
 * Configuration options for the `ObservablePool`.
 */
export interface ObservablePoolConfig {

    /**
     * Maximum number of concurrent running tasks.
     * Default: 10
     */
    readonly poolSize?: number;
}

/**
 * An injection token used to provide the configuration for the `ObservablePool`.
 */
export const OBSERVABLE_POOL_CONFIG =
    new InjectionToken<ObservablePoolConfig>('OBSERVABLE_POOL_CONFIG');
