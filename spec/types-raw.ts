// =============================================================================
// SHARED TYPES
// =============================================================================

export type Value = {
  headers?: Record<string, string>;
  data?: string;
};

// =============================================================================
// RECORDS
// =============================================================================

export type PromiseRecord = {
  id: string;
  state: "pending" | "resolved" | "rejected" | "rejected_canceled" | "rejected_timedout";
  param: Value;
  value: Value;
  tags: Record<string, string>;
  timeoutAt: number;
  createdAt: number;
  settledAt: number | null;
};

export type TaskRecord = {
  id: string;
  state: "pending" | "acquired" | "suspended" | "fulfilled";
  version: number;
};

export type ScheduleRecord = {
  id: string;
  cron: string;
  promiseId: string;
  promiseTimeout: number;
  promiseParam: Value;
  promiseTags: Record<string, string>;
  createdAt: number;
  nextRunAt: number;
  lastRunAt: number | null;
};

// =============================================================================
// REQUEST HEAD
// =============================================================================

export type RequestHead = {
  auth?: string;
  corrId: string;
  version: string;
};

// =============================================================================
// REQUESTS - PROMISE
// =============================================================================

export type PromiseGetReq = {
  kind: "promise.get";
  head: RequestHead;
  data: { id: string };
};

export type PromiseCreateReq = {
  kind: "promise.create";
  head: RequestHead;
  data: {
    id: string;
    timeoutAt: number;
    param?: Value;
    tags?: Record<string, string>;
  };
};

export type PromiseSettleReq = {
  kind: "promise.settle";
  head: RequestHead;
  data: {
    id: string;
    state: "resolved" | "rejected" | "rejected_canceled";
    value?: Value;
  };
};

export type PromiseRegisterReq = {
  kind: "promise.register";
  head: RequestHead;
  data: {
    awaited: string;
    awaiter: string;
  };
};

export type PromiseSubscribeReq = {
  kind: "promise.subscribe";
  head: RequestHead;
  data: {
    awaited: string;
    address: string;
  };
};

// =============================================================================
// REQUESTS - TASK
// =============================================================================

export type TaskGetReq = {
  kind: "task.get";
  head: RequestHead;
  data: { id: string };
};

export type TaskCreateReq = {
  kind: "task.create";
  head: RequestHead;
  data: {
    pid: string;
    ttl: number;
    action: PromiseCreateReq;
  };
};

export type TaskAcquireReq = {
  kind: "task.acquire";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    pid: string;
    ttl: number;
  };
};

export type TaskSuspendReq = {
  kind: "task.suspend";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    actions: PromiseRegisterReq[];
  };
};

export type TaskFulfillReq = {
  kind: "task.fulfill";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    action: PromiseSettleReq;
  };
};

export type TaskReleaseReq = {
  kind: "task.release";
  head: RequestHead;
  data: {
    id: string;
    version: number;
  };
};

export type TaskFenceReq = {
  kind: "task.fence";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    action: PromiseCreateReq | PromiseSettleReq;
  };
};

export type TaskHeartbeatReq = {
  kind: "task.heartbeat";
  head: RequestHead;
  data: {
    pid: string;
    tasks: { id: string; version: number }[];
  };
};

// =============================================================================
// REQUESTS - SCHEDULE
// =============================================================================

export type ScheduleGetReq = {
  kind: "schedule.get";
  head: RequestHead;
  data: { id: string };
};

export type ScheduleCreateReq = {
  kind: "schedule.create";
  head: RequestHead;
  data: {
    id: string;
    cron: string;
    promiseId: string;
    promiseTimeout: number;
    promiseParam?: Value;
    promiseTags?: Record<string, string>;
  };
};

export type ScheduleDeleteReq = {
  kind: "schedule.delete";
  head: RequestHead;
  data: { id: string };
};

// =============================================================================
// REQUESTS - DEBUG
// =============================================================================

export type DebugStartReq = {
  kind: "debug.start";
  head: RequestHead;
};

export type DebugResetReq = {
  kind: "debug.reset";
  head: RequestHead;
};

export type DebugTickReq = {
  kind: "debug.tick";
  head: RequestHead;
  data: { time: number };
};

export type DebugSnapReq = {
  kind: "debug.snap";
  head: RequestHead;
};

export type DebugStopReq = {
  kind: "debug.stop";
  head: RequestHead;
};

// =============================================================================
// REQUEST UNION
// =============================================================================

export type Request =
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
  | DebugStartReq
  | DebugResetReq
  | DebugTickReq
  | DebugSnapReq
  | DebugStopReq;

// =============================================================================
// RESPONSE HEAD
// =============================================================================

export type ResponseHead<S extends number> = {
  corrId: string;
  status: S;
  version: string;
};

// =============================================================================
// RESPONSES - PROMISE
// =============================================================================

export type PromiseGetRes =
  | { kind: "promise.get"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.get"; head: ResponseHead<400>; data: string }
  | { kind: "promise.get"; head: ResponseHead<404>; data: string }
  | { kind: "promise.get"; head: ResponseHead<429>; data: string }
  | { kind: "promise.get"; head: ResponseHead<500>; data: string };
export type PromiseGetRes200 = Extract<PromiseGetRes, { head: { status: 200 } }>;
export type PromiseGetRes400 = Extract<PromiseGetRes, { head: { status: 400 } }>;
export type PromiseGetRes404 = Extract<PromiseGetRes, { head: { status: 404 } }>;
export type PromiseGetRes429 = Extract<PromiseGetRes, { head: { status: 429 } }>;
export type PromiseGetRes500 = Extract<PromiseGetRes, { head: { status: 500 } }>;

export type PromiseCreateRes =
  | { kind: "promise.create"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.create"; head: ResponseHead<400>; data: string }
  | { kind: "promise.create"; head: ResponseHead<429>; data: string }
  | { kind: "promise.create"; head: ResponseHead<500>; data: string };
export type PromiseCreateRes200 = Extract<PromiseCreateRes, { head: { status: 200 } }>;
export type PromiseCreateRes400 = Extract<PromiseCreateRes, { head: { status: 400 } }>;
export type PromiseCreateRes429 = Extract<PromiseCreateRes, { head: { status: 429 } }>;
export type PromiseCreateRes500 = Extract<PromiseCreateRes, { head: { status: 500 } }>;

export type PromiseSettleRes =
  | { kind: "promise.settle"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.settle"; head: ResponseHead<400>; data: string }
  | { kind: "promise.settle"; head: ResponseHead<404>; data: string }
  | { kind: "promise.settle"; head: ResponseHead<429>; data: string }
  | { kind: "promise.settle"; head: ResponseHead<500>; data: string };
export type PromiseSettleRes200 = Extract<PromiseSettleRes, { head: { status: 200 } }>;
export type PromiseSettleRes400 = Extract<PromiseSettleRes, { head: { status: 400 } }>;
export type PromiseSettleRes404 = Extract<PromiseSettleRes, { head: { status: 404 } }>;
export type PromiseSettleRes429 = Extract<PromiseSettleRes, { head: { status: 429 } }>;
export type PromiseSettleRes500 = Extract<PromiseSettleRes, { head: { status: 500 } }>;

export type PromiseRegisterRes =
  | { kind: "promise.register"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.register"; head: ResponseHead<400>; data: string }
  | { kind: "promise.register"; head: ResponseHead<404>; data: string }
  | { kind: "promise.register"; head: ResponseHead<429>; data: string }
  | { kind: "promise.register"; head: ResponseHead<500>; data: string };
export type PromiseRegisterRes200 = Extract<PromiseRegisterRes, { head: { status: 200 } }>;
export type PromiseRegisterRes400 = Extract<PromiseRegisterRes, { head: { status: 400 } }>;
export type PromiseRegisterRes404 = Extract<PromiseRegisterRes, { head: { status: 404 } }>;
export type PromiseRegisterRes429 = Extract<PromiseRegisterRes, { head: { status: 429 } }>;
export type PromiseRegisterRes500 = Extract<PromiseRegisterRes, { head: { status: 500 } }>;

export type PromiseSubscribeRes =
  | { kind: "promise.subscribe"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.subscribe"; head: ResponseHead<400>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<404>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<429>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<500>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<501>; data: string };
export type PromiseSubscribeRes200 = Extract<PromiseSubscribeRes, { head: { status: 200 } }>;
export type PromiseSubscribeRes400 = Extract<PromiseSubscribeRes, { head: { status: 400 } }>;
export type PromiseSubscribeRes404 = Extract<PromiseSubscribeRes, { head: { status: 404 } }>;
export type PromiseSubscribeRes429 = Extract<PromiseSubscribeRes, { head: { status: 429 } }>;
export type PromiseSubscribeRes500 = Extract<PromiseSubscribeRes, { head: { status: 500 } }>;
export type PromiseSubscribeRes501 = Extract<PromiseSubscribeRes, { head: { status: 501 } }>;

// =============================================================================
// RESPONSES - TASK
// =============================================================================

export type TaskGetRes =
  | { kind: "task.get"; head: ResponseHead<200>; data: { task: TaskRecord } }
  | { kind: "task.get"; head: ResponseHead<400>; data: string }
  | { kind: "task.get"; head: ResponseHead<404>; data: string }
  | { kind: "task.get"; head: ResponseHead<429>; data: string }
  | { kind: "task.get"; head: ResponseHead<500>; data: string };
export type TaskGetRes200 = Extract<TaskGetRes, { head: { status: 200 } }>;
export type TaskGetRes400 = Extract<TaskGetRes, { head: { status: 400 } }>;
export type TaskGetRes404 = Extract<TaskGetRes, { head: { status: 404 } }>;
export type TaskGetRes429 = Extract<TaskGetRes, { head: { status: 429 } }>;
export type TaskGetRes500 = Extract<TaskGetRes, { head: { status: 500 } }>;

export type TaskCreateRes =
  | { kind: "task.create"; head: ResponseHead<200>; data: { task: TaskRecord; promise: PromiseRecord } }
  | { kind: "task.create"; head: ResponseHead<400>; data: string }
  | { kind: "task.create"; head: ResponseHead<409>; data: string }
  | { kind: "task.create"; head: ResponseHead<429>; data: string }
  | { kind: "task.create"; head: ResponseHead<500>; data: string }
  | { kind: "task.create"; head: ResponseHead<501>; data: string };
export type TaskCreateRes200 = Extract<TaskCreateRes, { head: { status: 200 } }>;
export type TaskCreateRes400 = Extract<TaskCreateRes, { head: { status: 400 } }>;
export type TaskCreateRes409 = Extract<TaskCreateRes, { head: { status: 409 } }>;
export type TaskCreateRes429 = Extract<TaskCreateRes, { head: { status: 429 } }>;
export type TaskCreateRes500 = Extract<TaskCreateRes, { head: { status: 500 } }>;
export type TaskCreateRes501 = Extract<TaskCreateRes, { head: { status: 501 } }>;

export type TaskAcquireRes =
  | { kind: "task.acquire"; head: ResponseHead<200>; data: { promise: PromiseRecord; preload: PromiseRecord[] } }
  | { kind: "task.acquire"; head: ResponseHead<400>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<404>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<409>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<429>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<500>; data: string };
export type TaskAcquireRes200 = Extract<TaskAcquireRes, { head: { status: 200 } }>;
export type TaskAcquireRes400 = Extract<TaskAcquireRes, { head: { status: 400 } }>;
export type TaskAcquireRes404 = Extract<TaskAcquireRes, { head: { status: 404 } }>;
export type TaskAcquireRes409 = Extract<TaskAcquireRes, { head: { status: 409 } }>;
export type TaskAcquireRes429 = Extract<TaskAcquireRes, { head: { status: 429 } }>;
export type TaskAcquireRes500 = Extract<TaskAcquireRes, { head: { status: 500 } }>;

export type TaskSuspendRes =
  | { kind: "task.suspend"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "task.suspend"; head: ResponseHead<300>; data: Record<string, never> }
  | { kind: "task.suspend"; head: ResponseHead<400>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<404>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<409>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<429>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<500>; data: string };
export type TaskSuspendRes200 = Extract<TaskSuspendRes, { head: { status: 200 } }>;
export type TaskSuspendRes300 = Extract<TaskSuspendRes, { head: { status: 300 } }>;
export type TaskSuspendRes400 = Extract<TaskSuspendRes, { head: { status: 400 } }>;
export type TaskSuspendRes404 = Extract<TaskSuspendRes, { head: { status: 404 } }>;
export type TaskSuspendRes409 = Extract<TaskSuspendRes, { head: { status: 409 } }>;
export type TaskSuspendRes429 = Extract<TaskSuspendRes, { head: { status: 429 } }>;
export type TaskSuspendRes500 = Extract<TaskSuspendRes, { head: { status: 500 } }>;

export type TaskFulfillRes =
  | { kind: "task.fulfill"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "task.fulfill"; head: ResponseHead<400>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<404>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<409>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<429>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<500>; data: string };
export type TaskFulfillRes200 = Extract<TaskFulfillRes, { head: { status: 200 } }>;
export type TaskFulfillRes400 = Extract<TaskFulfillRes, { head: { status: 400 } }>;
export type TaskFulfillRes404 = Extract<TaskFulfillRes, { head: { status: 404 } }>;
export type TaskFulfillRes409 = Extract<TaskFulfillRes, { head: { status: 409 } }>;
export type TaskFulfillRes429 = Extract<TaskFulfillRes, { head: { status: 429 } }>;
export type TaskFulfillRes500 = Extract<TaskFulfillRes, { head: { status: 500 } }>;

export type TaskReleaseRes =
  | { kind: "task.release"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "task.release"; head: ResponseHead<400>; data: string }
  | { kind: "task.release"; head: ResponseHead<404>; data: string }
  | { kind: "task.release"; head: ResponseHead<409>; data: string }
  | { kind: "task.release"; head: ResponseHead<429>; data: string }
  | { kind: "task.release"; head: ResponseHead<500>; data: string };
export type TaskReleaseRes200 = Extract<TaskReleaseRes, { head: { status: 200 } }>;
export type TaskReleaseRes400 = Extract<TaskReleaseRes, { head: { status: 400 } }>;
export type TaskReleaseRes404 = Extract<TaskReleaseRes, { head: { status: 404 } }>;
export type TaskReleaseRes409 = Extract<TaskReleaseRes, { head: { status: 409 } }>;
export type TaskReleaseRes429 = Extract<TaskReleaseRes, { head: { status: 429 } }>;
export type TaskReleaseRes500 = Extract<TaskReleaseRes, { head: { status: 500 } }>;

export type TaskFenceRes =
  | { kind: "task.fence"; head: ResponseHead<200>; data: { action: PromiseCreateRes | PromiseSettleRes } }
  | { kind: "task.fence"; head: ResponseHead<400>; data: string }
  | { kind: "task.fence"; head: ResponseHead<404>; data: string }
  | { kind: "task.fence"; head: ResponseHead<412>; data: string }
  | { kind: "task.fence"; head: ResponseHead<429>; data: string }
  | { kind: "task.fence"; head: ResponseHead<500>; data: string };
export type TaskFenceRes200 = Extract<TaskFenceRes, { head: { status: 200 } }>;
export type TaskFenceRes400 = Extract<TaskFenceRes, { head: { status: 400 } }>;
export type TaskFenceRes404 = Extract<TaskFenceRes, { head: { status: 404 } }>;
export type TaskFenceRes412 = Extract<TaskFenceRes, { head: { status: 412 } }>;
export type TaskFenceRes429 = Extract<TaskFenceRes, { head: { status: 429 } }>;
export type TaskFenceRes500 = Extract<TaskFenceRes, { head: { status: 500 } }>;

export type TaskHeartbeatRes =
  | { kind: "task.heartbeat"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "task.heartbeat"; head: ResponseHead<400>; data: string }
  | { kind: "task.heartbeat"; head: ResponseHead<429>; data: string }
  | { kind: "task.heartbeat"; head: ResponseHead<500>; data: string };
export type TaskHeartbeatRes200 = Extract<TaskHeartbeatRes, { head: { status: 200 } }>;
export type TaskHeartbeatRes400 = Extract<TaskHeartbeatRes, { head: { status: 400 } }>;
export type TaskHeartbeatRes429 = Extract<TaskHeartbeatRes, { head: { status: 429 } }>;
export type TaskHeartbeatRes500 = Extract<TaskHeartbeatRes, { head: { status: 500 } }>;

// =============================================================================
// RESPONSES - SCHEDULE
// =============================================================================

export type ScheduleGetRes =
  | { kind: "schedule.get"; head: ResponseHead<200>; data: { schedule: ScheduleRecord } }
  | { kind: "schedule.get"; head: ResponseHead<400>; data: string }
  | { kind: "schedule.get"; head: ResponseHead<404>; data: string }
  | { kind: "schedule.get"; head: ResponseHead<429>; data: string }
  | { kind: "schedule.get"; head: ResponseHead<500>; data: string }
  | { kind: "schedule.get"; head: ResponseHead<501>; data: string };
export type ScheduleGetRes200 = Extract<ScheduleGetRes, { head: { status: 200 } }>;
export type ScheduleGetRes400 = Extract<ScheduleGetRes, { head: { status: 400 } }>;
export type ScheduleGetRes404 = Extract<ScheduleGetRes, { head: { status: 404 } }>;
export type ScheduleGetRes429 = Extract<ScheduleGetRes, { head: { status: 429 } }>;
export type ScheduleGetRes500 = Extract<ScheduleGetRes, { head: { status: 500 } }>;
export type ScheduleGetRes501 = Extract<ScheduleGetRes, { head: { status: 501 } }>;

export type ScheduleCreateRes =
  | { kind: "schedule.create"; head: ResponseHead<200>; data: { schedule: ScheduleRecord } }
  | { kind: "schedule.create"; head: ResponseHead<400>; data: string }
  | { kind: "schedule.create"; head: ResponseHead<429>; data: string }
  | { kind: "schedule.create"; head: ResponseHead<500>; data: string }
  | { kind: "schedule.create"; head: ResponseHead<501>; data: string };
export type ScheduleCreateRes200 = Extract<ScheduleCreateRes, { head: { status: 200 } }>;
export type ScheduleCreateRes400 = Extract<ScheduleCreateRes, { head: { status: 400 } }>;
export type ScheduleCreateRes429 = Extract<ScheduleCreateRes, { head: { status: 429 } }>;
export type ScheduleCreateRes500 = Extract<ScheduleCreateRes, { head: { status: 500 } }>;
export type ScheduleCreateRes501 = Extract<ScheduleCreateRes, { head: { status: 501 } }>;

export type ScheduleDeleteRes =
  | { kind: "schedule.delete"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "schedule.delete"; head: ResponseHead<400>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<404>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<429>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<500>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<501>; data: string };
export type ScheduleDeleteRes200 = Extract<ScheduleDeleteRes, { head: { status: 200 } }>;
export type ScheduleDeleteRes400 = Extract<ScheduleDeleteRes, { head: { status: 400 } }>;
export type ScheduleDeleteRes404 = Extract<ScheduleDeleteRes, { head: { status: 404 } }>;
export type ScheduleDeleteRes429 = Extract<ScheduleDeleteRes, { head: { status: 429 } }>;
export type ScheduleDeleteRes500 = Extract<ScheduleDeleteRes, { head: { status: 500 } }>;
export type ScheduleDeleteRes501 = Extract<ScheduleDeleteRes, { head: { status: 501 } }>;

// =============================================================================
// RESPONSES - DEBUG
// =============================================================================

export type DebugStartRes =
  | { kind: "debug.start"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "debug.start"; head: ResponseHead<400>; data: string }
  | { kind: "debug.start"; head: ResponseHead<429>; data: string }
  | { kind: "debug.start"; head: ResponseHead<500>; data: string }
  | { kind: "debug.start"; head: ResponseHead<501>; data: string };
export type DebugStartRes200 = Extract<DebugStartRes, { head: { status: 200 } }>;
export type DebugStartRes400 = Extract<DebugStartRes, { head: { status: 400 } }>;
export type DebugStartRes429 = Extract<DebugStartRes, { head: { status: 429 } }>;
export type DebugStartRes500 = Extract<DebugStartRes, { head: { status: 500 } }>;
export type DebugStartRes501 = Extract<DebugStartRes, { head: { status: 501 } }>;

export type DebugResetRes =
  | { kind: "debug.reset"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "debug.reset"; head: ResponseHead<400>; data: string }
  | { kind: "debug.reset"; head: ResponseHead<429>; data: string }
  | { kind: "debug.reset"; head: ResponseHead<500>; data: string }
  | { kind: "debug.reset"; head: ResponseHead<501>; data: string };
export type DebugResetRes200 = Extract<DebugResetRes, { head: { status: 200 } }>;
export type DebugResetRes400 = Extract<DebugResetRes, { head: { status: 400 } }>;
export type DebugResetRes429 = Extract<DebugResetRes, { head: { status: 429 } }>;
export type DebugResetRes500 = Extract<DebugResetRes, { head: { status: 500 } }>;
export type DebugResetRes501 = Extract<DebugResetRes, { head: { status: 501 } }>;

export type DebugTickAction =
  | { kind: "promise.settle"; data: { id: string; state: "rejected_timedout" | "resolved" } }
  | { kind: "task.release"; data: { id: string; version: number } }
  | { kind: "task.retry"; data: { id: string; version: number } };

export type DebugTickRes =
  | { kind: "debug.tick"; head: ResponseHead<200>; data: DebugTickAction[] }
  | { kind: "debug.tick"; head: ResponseHead<400>; data: string }
  | { kind: "debug.tick"; head: ResponseHead<429>; data: string }
  | { kind: "debug.tick"; head: ResponseHead<500>; data: string }
  | { kind: "debug.tick"; head: ResponseHead<501>; data: string };
export type DebugTickRes200 = Extract<DebugTickRes, { head: { status: 200 } }>;
export type DebugTickRes400 = Extract<DebugTickRes, { head: { status: 400 } }>;
export type DebugTickRes429 = Extract<DebugTickRes, { head: { status: 429 } }>;
export type DebugTickRes500 = Extract<DebugTickRes, { head: { status: 500 } }>;
export type DebugTickRes501 = Extract<DebugTickRes, { head: { status: 501 } }>;

export type DebugSnapRes =
  | {
      kind: "debug.snap";
      head: ResponseHead<200>;
      data: {
        promises: PromiseRecord[];
        promiseTimeouts: { id: string; timeout: number }[];
        tasks: TaskRecord[];
        taskTimeouts: { id: string; type: number; timeout: number }[];
        messages: { id: string; version: number; address: string }[];
      };
    }
  | { kind: "debug.snap"; head: ResponseHead<400>; data: string }
  | { kind: "debug.snap"; head: ResponseHead<429>; data: string }
  | { kind: "debug.snap"; head: ResponseHead<500>; data: string }
  | { kind: "debug.snap"; head: ResponseHead<501>; data: string };
export type DebugSnapRes200 = Extract<DebugSnapRes, { head: { status: 200 } }>;
export type DebugSnapRes400 = Extract<DebugSnapRes, { head: { status: 400 } }>;
export type DebugSnapRes429 = Extract<DebugSnapRes, { head: { status: 429 } }>;
export type DebugSnapRes500 = Extract<DebugSnapRes, { head: { status: 500 } }>;
export type DebugSnapRes501 = Extract<DebugSnapRes, { head: { status: 501 } }>;

export type DebugStopRes =
  | { kind: "debug.stop"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "debug.stop"; head: ResponseHead<400>; data: string }
  | { kind: "debug.stop"; head: ResponseHead<429>; data: string }
  | { kind: "debug.stop"; head: ResponseHead<500>; data: string }
  | { kind: "debug.stop"; head: ResponseHead<501>; data: string };
export type DebugStopRes200 = Extract<DebugStopRes, { head: { status: 200 } }>;
export type DebugStopRes400 = Extract<DebugStopRes, { head: { status: 400 } }>;
export type DebugStopRes429 = Extract<DebugStopRes, { head: { status: 429 } }>;
export type DebugStopRes500 = Extract<DebugStopRes, { head: { status: 500 } }>;
export type DebugStopRes501 = Extract<DebugStopRes, { head: { status: 501 } }>;

// =============================================================================
// RESPONSE UNION
// =============================================================================

export type Response =
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
  | DebugStartRes
  | DebugResetRes
  | DebugTickRes
  | DebugSnapRes
  | DebugStopRes;

// =============================================================================
// MESSAGES
// =============================================================================

export type MessageHead = Record<string, never>;

export type InvokeOrResumeMsg = {
  kind: "invoke_or_resume";
  head: MessageHead;
  data: { task: { id: string; version: number } };
};

export type NotifyMsg = {
  kind: "notify";
  head: MessageHead;
  data: { promise: PromiseRecord };
};

export type Message = InvokeOrResumeMsg | NotifyMsg;
