import { Component, signal } from '@angular/core';
import { Submitter, SubmitterConfig } from '../submitter/submitter';
import { OBSERVABLE_POOL_CONFIG, ObservablePool } from '../core/concurrency/observable-pool';

@Component({
    selector: 'app-main',
    imports: [
        Submitter,
    ],
    templateUrl: './main.html',
    styleUrl: './main.scss',
    providers: [
        {
            provide: OBSERVABLE_POOL_CONFIG,
            useValue: { poolSize: 2 },
        },
        ObservablePool,
    ]
})
export class Main {

    /**
     * A configuration of submitter tasks to demonstrate the `ObservablePool`'s behavior with a `poolSize` of 2.
     *
     * This setup showcases several key scenarios:
     * 1. Parallel execution: Task 1 and 2 start simultaneously.
     * 2. Replenishment on success: When Task 1 (500ms) completes, Task 3 starts.
     * 3. Replenishment on error: When Task 2 (1000ms) fails, Task 4 starts.
     * 4. Concurrent completion: Task 3 and 4 finish, allowing Task 5 and 6 to run.
     */
    protected readonly submitters: SubmitterConfig[] = [
        { key: 'submitter1',sleepTime: 500 },
        { key: 'submitter2', sleepTime: 1000, error: true },
        { key: 'submitter3', sleepTime: 1000 },
        { key: 'submitter4', sleepTime: 500 },
        { key: 'submitter5', sleepTime: 300 },
        { key: 'submitter6', sleepTime: 300 },
    ];

    protected logs = signal<string[]>([]);

    writeStartLog(key: string): void {
        this.logs.update(logs => {
            logs.push(`[${new Date().toISOString()}] ${key} start processing`);
            return logs;
        });
    }

    writeStopLog(key: string): void {
        this.logs.update(logs => {
            logs.push(`[${new Date().toISOString()}] ${key} stop processing`);
            return logs;
        });
    }

}
