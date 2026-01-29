# RxJS Observable Pool POC

This project is a Proof of Concept (POC) for an `ObservablePool` service in Angular. It demonstrates how to manage and limit the number of concurrent observable-based tasks using RxJS.

## Core Concept

The `ObservablePool` service ensures that the number of simultaneously running tasks (like HTTP requests or other async operations) does not exceed a specified limit (`poolSize`). Tasks are queued and executed as soon as a slot in the pool becomes available.

This is primarily achieved using the `mergeMap` operator from RxJS with its concurrency parameter.

## Key Features

- **Concurrency Management**: Limits the number of active observable subscriptions.
- **Task Queuing**: Automatically queues tasks when the pool is full and executes them in order.
- **Configurable**: The pool size can be easily configured through an Angular `InjectionToken`.
- **Error Resilience**: An error in one task does not break the entire pool; other tasks will continue to be processed.

## How to Use

### 1. The `ObservablePool` Service

The core logic resides in [`src/app/core/concurrency/observable-pool.ts`](./src/app/core/concurrency/observable-pool.ts).

To use it, inject `ObservablePool` into your component or service and pass your observable-based task to the `run()` method.

```typescript
import { Component, inject } from '@angular/core';
import { ObservablePool } from './core/concurrency/observable-pool';
import { of, delay } from 'rxjs';

@Component({ /* ... */ })
export class MyComponent {
    private readonly pool = inject(ObservablePool);

    runTask() {
        const mySlowTask$ = of('done').pipe(delay(1000));

        this.pool.run(mySlowTask$).subscribe(result => {
            console.log(result); // done
        });
    }
}
```

### 2. Configuration

You can configure the `poolSize` by providing a value for the `OBSERVABLE_POOL_CONFIG` token in your component or module's providers array. The default size is 10.

```typescript
import { Component } from '@angular/core';
import { OBSERVABLE_POOL_CONFIG, ObservablePool } from './core/concurrency/observable-pool';

@Component({
  selector: 'app-my-component',
  // ...
  providers: [
    {
      provide: OBSERVABLE_POOL_CONFIG,
      useValue: { poolSize: 3 } // Set concurrency limit to 3
    },
    ObservablePool
  ]
})
export class MyComponent {
  // ...
}
```

## Running the Demo

This repository includes a demo application that visualizes the pool's behavior with a `poolSize` of 2.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the application:**
    ```bash
    ng serve
    ```

3.  Open your browser to [`http://localhost:4200/`](http://localhost:4200/).

The demo showcases several scenarios, including parallel execution, replenishment on success/error, and concurrent completion. You can observe the start and end times of each task to verify the pool's logic.
