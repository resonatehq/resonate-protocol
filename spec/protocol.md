# Protocol Specification

## Request Structure

All requests follow a common structure:

```ts
type Request<T> = {
  kind: string;
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: T;
}
```

**auth**

   Optional bearer token for authentication.

**corrId**

   Correlation identifier for request/response matching. The same value will be included in the response.

**version**

   The protocol version supported by the client. Uses date-based versioning (e.g., `"2025-01-15"`).

**resonate:debug_time**

   Optional override for the current time, used in debug mode. When set, the server will use this value as the current time instead of the system clock.

## Response Structure

All responses follow a common structure:

```ts
type Response<T> = {
  kind: string;
  head: {
    corrId: string;
    status: number;
    version: string;
  };
  data: T;
}
```

**corrId**

   Correlation identifier matching the request.

**status**

   The response status code.

**version**

   The protocol version used by the server. Uses date-based versioning (e.g., `"2025-01-15"`).

### Common Errors

The following errors may be returned by any operation.

**400**

   Bad request. The request was malformed or contained invalid data. The `data` field contains a description of the error.

**401**

   Unauthorized. The request is missing a valid JWT or the provided token is invalid.

**403**

   Forbidden. The JWT is valid but the caller does not have sufficient permissions to perform the requested operation.

**429**

   Too many requests. The client has exceeded the rate limit. The client should retry after a delay.

**500**

   Internal server error. An unexpected error occurred on the server. The `data` field may contain additional details.

## Requests

```ts
type Request =
  | PromiseGetReq
  | PromiseCreateReq
  | PromiseSettleReq
  | PromiseRegisterCallbackReq
  | PromiseRegisterListenerReq
  | PromiseSearchReq
  | TaskGetReq
  | TaskCreateReq
  | TaskAcquireReq
  | TaskReleaseReq
  | TaskSuspendReq
  | TaskHaltReq
  | TaskContinueReq
  | TaskFulfillReq
  | TaskFenceReq
  | TaskHeartbeatReq
  | TaskSearchReq
  | ScheduleGetReq
  | ScheduleCreateReq
  | ScheduleDeleteReq
  | ScheduleSearchReq
  | DebugStartReq
  | DebugResetReq
  | DebugTickReq
  | DebugSnapReq
  | DebugStopReq
```

## Responses

```ts
type Response =
  | PromiseGetRes
  | PromiseCreateRes
  | PromiseSettleRes
  | PromiseRegisterCallbackRes
  | PromiseRegisterListenerRes
  | PromiseSearchRes
  | TaskGetRes
  | TaskCreateRes
  | TaskAcquireRes
  | TaskReleaseRes
  | TaskSuspendRes
  | TaskHaltRes
  | TaskContinueRes
  | TaskFulfillRes
  | TaskFenceRes
  | TaskHeartbeatRes
  | TaskSearchRes
  | ScheduleGetRes
  | ScheduleCreateRes
  | ScheduleDeleteRes
  | ScheduleSearchRes
  | DebugStartRes
  | DebugResetRes
  | DebugTickRes
  | DebugSnapRes
  | DebugStopRes
```

## Promises

### Types

**Promise**

```ts
type Promise = {
  id: string;
  state: "pending" | "resolved" | "rejected" | "rejected_canceled" | "rejected_timedout";
  param: { headers?: { [key: string]: string }; data?: string };
  value: { headers?: { [key: string]: string }; data?: string };
  tags: { [key: string]: string };
  timeoutAt: number;
  createdAt: number;
  settledAt?: number;
}
```

**id**

   The identifier of the promise.

**state**

   The current state of the promise. Can be one of: `pending`, `resolved`, `rejected`, `rejected_canceled`, or `rejected_timedout`.

**param**

   The promise parameters. The `data` field is base64 encoded.

**value**

   The promise result value. The `data` field is base64 encoded.

**tags**

   Key-value metadata for the promise.

**timeoutAt**

   Unix timestamp in milliseconds when the promise will be automatically rejected with state `rejected_timedout`.

**createdAt**

   Unix timestamp in milliseconds when the promise was created.

**settledAt**

   Unix timestamp in milliseconds when the promise was settled. Only present for promises in a terminal state.

### Get

Retrieves a promise by its identifier.

**Request**

```ts
type PromiseGetReq = {
  kind: "promise.get";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
  };
}
```

**id**

   The unique identifier of the promise to retrieve.

**Response**

```ts
type PromiseGetRes = {
  kind: "promise.get",
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promise: Promise;
  };
}
```

Returns the promise if found.

**Errors**

**404**

   Promise not found.

### Create

Creates a new promise with the specified identifier.

**Request**

```ts
type PromiseCreateReq = {
  kind: "promise.create";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    param: { headers?: { [key: string]: string }; data?: string };
    tags: { [key: string]: string };
    timeoutAt: number;
  };
}
```

**id**

   The unique identifier for the promise.

**param**

   The promise parameters. The `data` field must be base64 encoded.

**tags**

   Key-value metadata for the promise.
   - If a `resonate:target` tag is present, an `ExecuteMsg` is sent to the specified address on invocation and resumption.
   - If a `resonate:timer` tag is set to `true`, the promise transitions to `resolved` instead of `rejected_timedout` when the timeout is reached.
   - If a `resonate:delay` tag is present, it specifies a unix timestamp in milliseconds at which the `ExecuteMsg` is sent on invocation.
   - If a `resonate:origin` tag is present, it identifies the root promise that initiated the execution. All promises in an execution tree share the same `resonate:origin` value.
   - If a `resonate:branch` tag is present, it identifies the current execution branch. Set when a promise in an execution tree has a `resonate:target` tag.
   - If a `resonate:parent` tag is present, it identifies the direct parent promise that created this promise in the execution tree.

**timeoutAt**

   Unix timestamp in milliseconds when the promise will timeout.

**Response**

```ts
type PromiseCreateRes = {
  kind: "promise.create";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promise: Promise;
  };
}
```

Returns the promise. If a promise with the same identifier already exists, returns the existing promise (idempotent).

### Settle

Settles a pending promise with a terminal state.

**Request**

```ts
type PromiseSettleReq = {
  kind: "promise.settle";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    state: "resolved" | "rejected" | "rejected_canceled";
    value: { headers?: { [key: string]: string }; data?: string };
  };
}
```

**id**

   The unique identifier of the promise to settle.

**state**

   The terminal state for the promise. Use `resolved` for successful completion, `rejected` for failure, or `rejected_canceled` for cancellation.

**value**

   The promise result value. The `data` field must be base64 encoded.

**Errors**

**404**

   Promise not found.

**Response**

```ts
type PromiseSettleRes = {
  kind: "promise.settle";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promise: Promise;
  };
}
```

Returns the promise in its current state. If the promise is already settled, returns the existing state (idempotent).

### Register Callback

Registers a dependency between two promises, indicating that the awaiter is waiting for the awaited promise to settle.

**Request**

```ts
type PromiseRegisterCallbackReq = {
  kind: "promise.register_callback";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    awaiter: string;
    awaited: string;
  };
}
```

**awaiter**

   The identifier of the promise that is waiting.

**awaited**

   The identifier of the promise being waited on.

**Validation**

- The `awaiter` and `awaited` must be different promises. A promise cannot register a dependency on itself.

**Response**

```ts
type PromiseRegisterCallbackRes = {
  kind: "promise.register_callback";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promise: Promise;
  };
}
```

Returns the awaited promise. If the awaited promise is already settled, no dependency is registered.

**Errors**

**404**

   Awaited promise not found.

**422**

   Awaiter promise not found or does not have a target address.

### Register Listener

Registers a listener for a promise, receiving a notification when it settles.

**Request**

```ts
type PromiseRegisterListenerReq = {
  kind: "promise.register_listener";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    awaited: string;
    address: string;
  };
}
```

**awaited**

   The identifier of the promise to subscribe to.

**address**

   The destination address where an `UnblockMsg` will be sent when the promise settles.

**Response**

```ts
type PromiseRegisterListenerRes = {
  kind: "promise.register_listener";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promise: Promise;
  };
}
```

Returns the awaited promise. If the awaited promise is already settled, no subscription is registered.

**Errors**

**404**

   Promise not found.

**501**

   Not implemented.

### Search

Searches for promises matching the specified criteria.

**Request**

```ts
type PromiseSearchReq = {
  kind: "promise.search";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    state?: "pending" | "resolved" | "rejected" | "rejected_canceled" | "rejected_timedout";
    tags?: { [key: string]: string };
    limit?: number;
    cursor?: string;
  };
}
```

**state**

   Optional filter by promise state.

**tags**

   Optional filter by tag key-value pairs.

**limit**

   Number of results per page.

**cursor**

   Cursor for pagination, obtained from a previous search response.

**Response**

```ts
type PromiseSearchRes = {
  kind: "promise.search";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promises: Promise[];
    cursor?: string;
  };
}
```

Returns a list of matching promises and an optional cursor for the next page of results.

**Errors**

**501**

   Not implemented.

## Tasks

### Types

**Task**

```ts
type Task = {
  id: string;
  state: "pending" | "acquired" | "suspended" | "halted" | "fulfilled";
  version: number;
  resumes: string[] | number | boolean;
  ttl?: number;
  pid?: string;
}
```

**id**

   The identifier of the task.

**state**

   The current state of the task. Can be one of: `pending`, `acquired`, `suspended`, `halted`, or `fulfilled`.

**version**

   The task version for optimistic concurrency control.

**ttl**

   Time-to-live in milliseconds. The interval within which the task must be heartbeated to maintain its lease.
   Absent when the task is in the `suspended`, `halted`, or `fulfilled` state.

**pid**

   The process identifier of the worker that created or acquired the task.
   Absent when the task is in the `suspended`, `halted`, or `fulfilled` state.

**resumes**

   The resume messages queued for the task to process. Can be one of:

   - `string[]` — the full list of queued resume message identifiers
   - `number` — the count of queued resume messages
   - `boolean` — whether any resume messages are queued

### Get

Retrieves a task by its identifier.

**Request**

```ts
type TaskGetReq = {
  kind: "task.get";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
  };
}
```

**id**

   The unique identifier of the task to retrieve.

**Response**

```ts
type TaskGetRes = {
  kind: "task.get";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    task: Task;
  };
}
```

Returns the task if found.

**Errors**

**404**

   Task not found.

### Create

Creates a new task and its associated promise.

**Request**

```ts
type TaskCreateReq = {
  kind: "task.create";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    pid: string;
    ttl: number;
    action: PromiseCreateReq;
  };
}
```

**pid**

   The process identifier of the worker creating the task.

**ttl**

   Time-to-live in milliseconds. Must be a positive integer. The task must be heartbeated within this interval to maintain its lease.

**action**

   A `PromiseCreateReq` specifying the promise to create for this task.

**Validation**

- The action must have a `resonate:target` tag.

**Response**

```ts
type TaskCreateRes = {
  kind: "task.create";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    task?: Task;
    promise: Promise;
    preload: Promise[];
  };
}
```

Returns the task and its associated promise. If the task is pending, acquires the task and returns it in the acquired state. If the promise is already settled, returns the promise only. The `preload` field contains all promises that share the same `resonate:branch` value as the task's promise. When a task transitions to the acquired state, its `resumes` field is always cleared.

**Errors**

**409**

   The task already exists and is acquired, suspended, or halted.

**501**

   Not implemented.

### Acquire

Acquires a lease on a pending task.

**Request**

```ts
type TaskAcquireReq = {
  kind: "task.acquire";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    version: number;
    pid: string;
    ttl: number;
  };
}
```

**id**

   The unique identifier of the task to acquire.

**version**

   The expected task version for optimistic concurrency control.

**pid**

   The process identifier of the worker acquiring the task.

**ttl**

   Time-to-live in milliseconds for the lease. Must be a positive integer.

**Response**

```ts
type TaskAcquireRes = {
  kind: "task.acquire";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    task: Task;
    promise: Promise;
    preload: Promise[];
  };
}
```

Returns the task and its associated promise. The `preload` field contains all promises that share the same `resonate:branch` value as the task's promise. When a task transitions to the acquired state, its `resumes` field is always cleared.

**Errors**

**404**

   Task not found.

**409**

   The task is not pending or the version does not match.

### Release

Releases a task's lease without completing it, allowing the task to be re-acquired.

**Request**

```ts
type TaskReleaseReq = {
  kind: "task.release";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    version: number;
  };
}
```

**id**

   The unique identifier of the task to release.

**version**

   The expected task version for optimistic concurrency control.

**Response**

```ts
type TaskReleaseRes = {
  kind: "task.release";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**404**

   Task not found.

**409**

   The task is not acquired or the version does not match.

### Suspend

Suspends a task while waiting for one or more promises to settle.

**Request**

```ts
type TaskSuspendReq = {
  kind: "task.suspend";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    version: number;
    actions: PromiseRegisterCallbackReq[];
  };
}
```

**id**

   The unique identifier of the task to suspend.

**version**

   The expected task version for optimistic concurrency control.

**actions**

   An array of `PromiseRegisterCallbackReq` specifying the promises to await.

**Validation**

- The `actions` array must not be empty.
- All actions must have their `awaiter` equal to the task `id`.
- No action's `awaited` promise may equal the task `id`.

**Response**

```ts
type TaskSuspendRes = {
  kind: "task.suspend";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

Returns status `200` if the task was suspended.

```ts
type TaskSuspendRes = {
  kind: "task.suspend";
  head: {
    corrId: string;
    status: 300;
    version: string;
  };
  data: {
    preload: Promise[];
  };
}
```

Returns status `300` if an action promise has already settled or if a previously awaited promise has already settled, indicating the worker can continue execution immediately with the current lease. The task remains in the acquired state with its `resumes` field cleared. The `preload` field contains all promises that share the same `resonate:branch` value as the task's promise.

**Errors**

**404**

   Task not found.

**409**

   The task is not acquired or the version does not match.

**422**

   Awaited promise not found.

### Halt

Halts a pending, acquired, or suspended task, preventing it from being acquired or making further progress.

**Request**

```ts
type TaskHaltReq = {
  kind: "task.halt";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
  };
}
```

**id**

   The unique identifier of the task to halt.

**Response**

```ts
type TaskHaltRes = {
  kind: "task.halt";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**404**

   Task not found.

**409**

   Task is not in a haltable state (already fulfilled).

### Continue

Resumes a halted task, transitioning it back to pending.

**Request**

```ts
type TaskContinueReq = {
  kind: "task.continue";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
  };
}
```

**id**

   The unique identifier of the task to continue.

**Response**

```ts
type TaskContinueRes = {
  kind: "task.continue";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**404**

   Task not found.

**409**

   Task is not halted.

### Fulfill

Completes a task and settles its associated promise.

**Request**

```ts
type TaskFulfillReq = {
  kind: "task.fulfill";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    version: number;
    action: PromiseSettleReq;
  };
}
```

**id**

   The unique identifier of the task to fulfill.

**version**

   The expected task version for optimistic concurrency control.

**action**

   A `PromiseSettleReq` specifying how to settle the task's promise.

**Validation**

- The action `id` must equal the task `id`.

**Response**

```ts
type TaskFulfillRes = {
  kind: "task.fulfill";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promise: Promise;
  };
}
```

Returns the promise in its settled state.

**Errors**

**404**

   Task not found.

**409**

   The task is not acquired or the version does not match.

### Fence

Executes a promise operation only if the task's lease is still valid.

**Request**

```ts
type TaskFenceReq = {
  kind: "task.fence";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    version: number;
    action: PromiseCreateReq | PromiseSettleReq;
  };
}
```

**id**

   The unique identifier of the task.

**version**

   The expected task version for optimistic concurrency control.

**action**

   A `PromiseCreateReq` or `PromiseSettleReq` to execute if the lease is valid.

**Response**

```ts
type TaskFenceRes = {
  kind: "task.fence";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    action: PromiseCreateRes | PromiseSettleRes;
    preload: Promise[];
  };
}
```

Returns the result of the fenced operation.

**Errors**

**404**

   Task not found.

**409**

   The task is not acquired or the version does not match.

### Heartbeat

Extends the lease for one or more tasks.

**Request**

```ts
type TaskHeartbeatReq = {
  kind: "task.heartbeat";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    pid: string;
    tasks: { id: string; version: number }[];
  };
}
```

**pid**

   The process identifier of the worker.

**tasks**

   An array of tasks to heartbeat.

**Response**

```ts
type TaskHeartbeatRes = {
  kind: "task.heartbeat";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

### Search

Searches for tasks matching the specified criteria.

**Request**

```ts
type TaskSearchReq = {
  kind: "task.search";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    state?: "pending" | "acquired" | "suspended" | "halted" | "fulfilled";
    limit?: number;
    cursor?: string;
  };
}
```

**state**

   Optional filter by task state.

**limit**

   Number of results per page.

**cursor**

   Cursor for pagination, obtained from a previous search response.

**Response**

```ts
type TaskSearchRes = {
  kind: "task.search";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    tasks: Task[];
    cursor?: string;
  };
}
```

Returns a list of matching tasks and an optional cursor for the next page of results.

**Errors**

**501**

   Not implemented.

## Schedules

### Types

**Schedule**

```ts
type Schedule = {
  id: string;
  cron: string;
  promiseId: string;
  promiseTimeout: number;
  promiseParam: { headers?: { [key: string]: string }; data?: string };
  promiseTags: { [key: string]: string };
  createdAt: number;
  nextRunAt: number;
  lastRunAt?: number;
}
```

**id**

   The identifier of the schedule.

**cron**

   A cron expression (standard 5-field format) specifying when to create promises.

**promiseId**

   A template for the promise identifier. Supports `{{.id}}` and `{{.timestamp}}` substitutions.

**promiseTimeout**

   The timeout in milliseconds for created promises.

**promiseParam**

   The parameters for created promises. The `data` field is base64 encoded.

**promiseTags**

   Key-value metadata for created promises.

**createdAt**

   Unix timestamp in milliseconds when the schedule was created.

**nextRunAt**

   Unix timestamp in milliseconds for the next scheduled run.

**lastRunAt**

   Unix timestamp in milliseconds of the last run. Only present if the schedule has run at least once.

### Get

Retrieves a schedule by its identifier.

**Request**

```ts
type ScheduleGetReq = {
  kind: "schedule.get";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
  };
}
```

**id**

   The unique identifier of the schedule to retrieve.

**Response**

```ts
type ScheduleGetRes = {
  kind: "schedule.get";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    schedule: Schedule;
  };
}
```

Returns the schedule if found.

**Errors**

**404**

   Schedule not found.

**501**

   Not implemented.

### Create

Creates a new schedule that creates promises on a recurring basis.

**Request**

```ts
type ScheduleCreateReq = {
  kind: "schedule.create";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
    cron: string;
    promiseId: string;
    promiseTimeout: number;
    promiseParam: { headers?: { [key: string]: string }; data?: string };
    promiseTags: { [key: string]: string };
  };
}
```

**id**

   The unique identifier for the schedule.

**cron**

   A cron expression (standard 5-field format) specifying when to create promises.

**promiseId**

   A template for the promise identifier. Supports `{{.id}}` and `{{.timestamp}}` substitutions.

**promiseTimeout**

   The timeout in milliseconds for created promises.

**promiseParam**

   The parameters for created promises. The `data` field must be base64 encoded.

**promiseTags**

   Key-value metadata for created promises.

**Response**

```ts
type ScheduleCreateRes = {
  kind: "schedule.create";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    schedule: Schedule;
  };
}
```

Returns the schedule. If a schedule with the same identifier already exists, returns the existing schedule (idempotent).

**Errors**

**501**

   Not implemented.

### Delete

Deletes a schedule.

**Request**

```ts
type ScheduleDeleteReq = {
  kind: "schedule.delete";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    id: string;
  };
}
```

**id**

   The unique identifier of the schedule to delete.

**Response**

```ts
type ScheduleDeleteRes = {
  kind: "schedule.delete";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**404**

   Schedule not found.

**501**

   Not implemented.

### Search

Searches for schedules matching the specified criteria.

**Request**

```ts
type ScheduleSearchReq = {
  kind: "schedule.search";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    tags?: { [key: string]: string };
    limit?: number;
    cursor?: string;
  };
}
```

**tags**

   Optional filter by tag key-value pairs.

**limit**

   Number of results per page.

**cursor**

   Cursor for pagination, obtained from a previous search response.

**Response**

```ts
type ScheduleSearchRes = {
  kind: "schedule.search";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    schedules: Schedule[];
    cursor?: string;
  };
}
```

Returns a list of matching schedules and an optional cursor for the next page of results.

**Errors**

**501**

   Not implemented.

## Debug

Optional debug operations for testing and development.

### Start

Starts the debug session.

**Request**

```ts
type DebugStartReq = {
  kind: "debug.start";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {};
}
```

**Response**

```ts
type DebugStartRes = {
  kind: "debug.start";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**501**

   Not implemented.

### Reset

Resets the debug session.

**Request**

```ts
type DebugResetReq = {
  kind: "debug.reset";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {};
}
```

**Response**

```ts
type DebugResetRes = {
  kind: "debug.reset";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**501**

   Not implemented.

### Tick

Times out promises and tasks that have exceeded the specified timestamp.

**Request**

```ts
type DebugTickReq = {
  kind: "debug.tick";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {
    time: number;
  };
}
```

**time**

   Unix timestamp in milliseconds to advance to.

**Response**

```ts
type DebugTickRes = {
  kind: "debug.tick";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: Array<
    | { kind: "promise.settle"; data: { id: string; state: "rejected_timedout" | "resolved" } }
    | { kind: "task.release"; data: { id: string; version: number } }
    | { kind: "task.retry"; data: { id: string; version: number } }
  >;
}
```

Returns an array of actions taken during the tick.

**Errors**

**501**

   Not implemented.

### Snap

Takes a snapshot of the current debug session state.

**Request**

```ts
type DebugSnapReq = {
  kind: "debug.snap";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {};
}
```

**Response**

```ts
type DebugSnapRes = {
  kind: "debug.snap";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    promises: Promise[];
    promiseTimeouts: { id: string; timeout: number }[];
    callbacks: { awaiter: string; awaited: string }[];
    listeners?: { id: string; address: string }[];
    tasks: Task[];
    taskTimeouts: { id: string; type: number; timeout: number }[];
    messages: { address: string; message: Message }[];
  };
}
```

Returns the current state of all promises, tasks, their timeouts, callbacks, listeners, and pending messages.

**Errors**

**501**

   Not implemented.

### Stop

Stops the debug session.

**Request**

```ts
type DebugStopReq = {
  kind: "debug.stop";
  head: {
    auth?: string;
    corrId: string;
    version: string;
    "resonate:debug_time"?: number;
  };
  data: {};
}
```

**Response**

```ts
type DebugStopRes = {
  kind: "debug.stop";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {};
}
```

**Errors**

**501**

   Not implemented.

## Messages

```ts
type Message = ExecuteMsg | UnblockMsg;
```

### ExecuteMsg

Sent to the address specified in the `resonate:target` tag on invocation and resumption.

```ts
type ExecuteMsg = {
  kind: "execute";
  head: { serverUrl?: string };
  data: {
    task: { id: string; version: number };
  };
}
```

### UnblockMsg

Sent to the address specified in a `promise.register_listener` request when the promise settles.

```ts
type UnblockMsg = {
  kind: "unblock";
  head: { serverUrl?: string };
  data: {
    promise: Promise;
  };
}
```
