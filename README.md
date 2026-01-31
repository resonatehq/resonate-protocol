# Resonate Protocol Specification

## Overview

A transport-agnostic durable execution protocol.

### Request Structure

All requests follow a common structure:

```ts
interface Request {
  kind: string;
  head: {
    auth?: string;
    corrId: string;
    version: string;
  };
  data: { ... };
}
```

**auth**

   Optional bearer token for authentication.

**corrId**

   Correlation identifier for request/response matching. The same value will be included in the response.

**version**

   The protocol version supported by the client. Uses date-based versioning (e.g., `"2025-01-15"`).

### Response Structure

All responses follow a common structure:

```ts
interface Response {
  kind: string;
  head: {
    corrId: string;
    status: number;
    version: string;
  };
  data: { ... };
}
```

**corrId**

   Correlation identifier matching the request.

**status**

   The response status code.

**version**

   The protocol version used by the server. Uses date-based versioning (e.g., `"2025-01-15"`).

## Requests

```ts
type Req =
  | PromiseGetReq
  | PromiseCreateReq
  | PromiseSettleReq
  | PromiseRegisterReq
  | PromiseSubscribeReq
  | TaskGetReq
  | TaskCreateReq
  | TaskAcquireReq
  | TaskSuspendReq
  | TaskFulfillReq
  | TaskReleaseReq
  | TaskFenceReq
  | TaskHeartbeatReq
  | ScheduleGetReq
  | ScheduleCreateReq
  | ScheduleDeleteReq
```

## Responses

```ts
type Res =
  | PromiseGetRes
  | PromiseCreateRes
  | PromiseSettleRes
  | PromiseRegisterRes
  | PromiseSubscribeRes
  | TaskGetRes
  | TaskCreateRes
  | TaskAcquireRes
  | TaskSuspendRes
  | TaskFulfillRes
  | TaskReleaseRes
  | TaskFenceRes
  | TaskHeartbeatRes
  | ScheduleGetRes
  | ScheduleCreateRes
  | ScheduleDeleteRes
  | Error

interface Error {
  kind: string;
  head: {
    corrId: string;
    status: 400 | 404 | 409 | 429 | 500;
    version: string;
  };
  data: string;
}
```

## Promises

### Types

**Promise**

```ts
interface Promise {
  id: string;
  state: "pending" | "resolved" | "rejected" | "rejected_canceled" | "rejected_timedout";
  param: { headers: { [key: string]: string }; data: string };
  value: { headers: { [key: string]: string }; data: string };
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
interface PromiseGetReq {
  kind: "promise.get";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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
interface PromiseGetRes {
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
interface PromiseCreateReq {
  kind: "promise.create";
  head: {
    auth?: string;
    corrId: string;
    version: string;
  };
  data: {
    id: string;
    param: { headers: { [key: string]: string }; data: string };
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
   - If a `resonate:target` tag is present, an `InvokeMessage` is sent to the specified address on creation.
   - If a `resonate:delay` tag is present with a unix timestamp in milliseconds, the `InvokeMessage` is delayed until that time.
   - If a `resonate:timer` tag is set to `true`, the promise transitions to `resolved` instead of `rejected_timedout` when the timeout is reached.

**timeoutAt**

   Unix timestamp in milliseconds when the promise will timeout.

**Response**

```ts
interface PromiseCreateRes {
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
interface PromiseSettleReq {
  kind: "promise.settle";
  head: {
    auth?: string;
    corrId: string;
    version: string;
  };
  data: {
    id: string;
    state: "resolved" | "rejected" | "rejected_canceled";
    value: { headers: { [key: string]: string }; data: string };
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
interface PromiseSettleRes {
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

### Register

Registers a dependency between two promises, indicating that the awaiter is waiting for the awaited promise to settle.

**Request**

```ts
interface PromiseRegisterReq {
  kind: "promise.register";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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

**Response**

```ts
interface PromiseRegisterRes {
  kind: "promise.register";
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

   Promise not found.

### Subscribe

Subscribes to a promise, receiving a notification when it settles.

**Request**

```ts
interface PromiseSubscribeReq {
  kind: "promise.subscribe";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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

   The destination address where a `NotifyMessage` will be sent when the promise settles.

**Response**

```ts
interface PromiseSubscribeRes {
  kind: "promise.subscribe";
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

## Tasks

### Types

**Task**

```ts
interface Task {
  id: string;
  state: "pending" | "acquired" | "suspended" | "fulfilled";
  version: number;
}
```

**id**

   The identifier of the task.

**state**

   The current state of the task. Can be one of: `pending`, `acquired`, `suspended`, or `fulfilled`.

**version**

   The task version for optimistic concurrency control.

### Get

Retrieves a task by its identifier.

**Request**

```ts
interface TaskGetReq {
  kind: "task.get";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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
interface TaskGetRes {
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
interface TaskCreateReq {
  kind: "task.create";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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

   Time-to-live in milliseconds. The task must be heartbeated within this interval to maintain its lease.

**action**

   A `PromiseCreateReq` specifying the promise to create for this task.

**Response**

```ts
interface TaskCreateRes {
  kind: "task.create";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    task: Task;
    promise: Promise;
  };
}
```

Returns the task and its associated promise.

### Acquire

Acquires a lease on a pending task.

**Request**

```ts
interface TaskAcquireReq {
  kind: "task.acquire";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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

   Time-to-live in milliseconds for the lease.

**Response**

```ts
interface TaskAcquireRes {
  kind: "task.acquire";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    kind: "invoke" | "resume";
    data: { promise: Promise, preload: Promise[] };
  }
}
```

Returns either an `invoke` or `resume` payload. An `invoke` is returned when the task is being executed for the first time. A `resume` is returned when the task is resuming after a previously awaited promise has settled.

**Errors**

**404**

   Task not found.

**409**

   Version mismatch.

### Suspend

Suspends a task while waiting for one or more promises to settle.

**Request**

```ts
interface TaskSuspendReq {
  kind: "task.suspend";
  head: {
    auth?: string;
    corrId: string;
    version: string;
  };
  data: {
    id: string;
    version: number;
    actions: PromiseRegisterReq[];
  };
}
```

**id**

   The unique identifier of the task to suspend.

**version**

   The expected task version for optimistic concurrency control.

**actions**

   An array of `PromiseRegisterReq` specifying the promises to await.

**Response**

```ts
interface TaskSuspendRes {
  kind: "task.suspend";
  head: {
    corrId: string;
    status: 200 | 300;
    version: string;
  };
}
```

Returns status `200` if the task was suspended. Returns status `300` if an action promise has already settled or if a previously awaited promise has already settled, indicating the worker can continue execution immediately with the current lease.

**Errors**

**404**

   Task not found.

**409**

   Version mismatch.

### Fulfill

Completes a task and settles its associated promise.

**Request**

```ts
interface TaskFulfillReq {
  kind: "task.fulfill";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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

**Response**

```ts
interface TaskFulfillRes {
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

Returns the promise in its current state. If the promise is already settled, returns the existing state (idempotent).

**Errors**

**404**

   Task not found.

**409**

   Version mismatch.

### Release

Releases a task's lease without completing it, allowing the task to be re-acquired.

**Request**

```ts
interface TaskReleaseReq {
  kind: "task.release";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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
interface TaskReleaseRes {
  kind: "task.release";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
}
```

**Errors**

**404**

   Task not found.

**409**

   Version mismatch.

### Fence

Executes a promise operation only if the task's lease is still valid.

**Request**

```ts
interface TaskFenceReq {
  kind: "task.fence";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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
interface TaskFenceRes {
  kind: "task.fence";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
  data: {
    action: PromiseCreateRes | PromiseSettleRes;
  };
}
```

Returns the result of the fenced operation.

**Errors**

**404**

   Task not found.

**412**

   Fence precondition check failed.

### Heartbeat

Extends the lease for one or more tasks.

**Request**

```ts
interface TaskHeartbeatReq {
  kind: "task.heartbeat";
  head: {
    auth?: string;
    corrId: string;
    version: string;
  };
  data: {
    pid: string;
    tasks: Task[];
  };
}
```

**pid**

   The process identifier of the worker.

**tasks**

   An array of tasks to heartbeat.

**Response**

```ts
interface TaskHeartbeatRes {
  kind: "task.heartbeat";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
}
```

## Schedules

### Types

**Schedule**

```ts
interface Schedule {
  id: string;
  cron: string;
  promiseId: string;
  promiseTimeout: number;
  promiseParam: { headers: { [key: string]: string }; data: string };
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
interface ScheduleGetReq {
  kind: "schedule.get";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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
interface ScheduleGetRes {
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

### Create

Creates a new schedule that creates promises on a recurring basis.

**Request**

```ts
interface ScheduleCreateReq {
  kind: "schedule.create";
  head: {
    auth?: string;
    corrId: string;
    version: string;
  };
  data: {
    id: string;
    cron: string;
    promiseId: string;
    promiseTimeout: number;
    promiseParam: { headers: { [key: string]: string }; data: string };
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
interface ScheduleCreateRes {
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

### Delete

Deletes a schedule.

**Request**

```ts
interface ScheduleDeleteReq {
  kind: "schedule.delete";
  head: {
    auth?: string;
    corrId: string;
    version: string;
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
interface ScheduleDeleteRes {
  kind: "schedule.delete";
  head: {
    corrId: string;
    status: 200;
    version: string;
  };
}
```

**Errors**

**404**

   Schedule not found.

## Messages

```ts
type Message = InvokeMessage | ResumeMessage | NotifyMessage;
```

### InvokeMessage

Sent to the address specified in the `resonate:invoke` tag when a promise is created.

```ts
interface InvokeMessage {
  kind: "invoke";
  head: {};
  data: {
    task: Task;
  };
}
```

### ResumeMessage

Sent to the address specified in the `resonate:invoke` tag when a previously awaited promise settles.

```ts
interface ResumeMessage {
  kind: "resume";
  head: {};
  data: {
    task: Task;
  };
}
```

### NotifyMessage

Sent to the address specified in a `promise.subscribe` request when the promise settles.

```ts
interface NotifyMessage {
  kind: "notify";
  head: {};
  data: {
    promise: Promise;
  };
}
```
