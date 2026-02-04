// =============================================================================
// SHARED TYPES
// =============================================================================

export type Value = {
  headers: Record<string, string>;
  data: string;
};

export type SettlementState = "resolved" | "rejected" | "rejected_canceled";

export type PromiseState =
  | "pending"
  | "resolved"
  | "rejected"
  | "rejected_canceled"
  | "rejected_timedout";

export type TaskState = "pending" | "acquired" | "suspended" | "fulfilled";

// =============================================================================
// RECORDS
// =============================================================================

export type PromiseRecord = {
  id: string;
  state: PromiseState;
  param: Value;
  value: Value;
  tags: Record<string, string>;
  timeoutAt: number;
  createdAt: number;
  settledAt: number | null;
};

export type TaskRecord = {
  id: string;
  state: TaskState;
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
    state: SettlementState;
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
    tasks: Pick<TaskRecord, "id" | "version">[];
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
  | ScheduleDeleteReq;

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

export type PromiseCreateRes =
  | { kind: "promise.create"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.create"; head: ResponseHead<400>; data: string }
  | { kind: "promise.create"; head: ResponseHead<429>; data: string }
  | { kind: "promise.create"; head: ResponseHead<500>; data: string };

export type PromiseSettleRes =
  | { kind: "promise.settle"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.settle"; head: ResponseHead<400>; data: string }
  | { kind: "promise.settle"; head: ResponseHead<404>; data: string }
  | { kind: "promise.settle"; head: ResponseHead<429>; data: string }
  | { kind: "promise.settle"; head: ResponseHead<500>; data: string };

export type PromiseRegisterRes =
  | { kind: "promise.register"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.register"; head: ResponseHead<400>; data: string }
  | { kind: "promise.register"; head: ResponseHead<404>; data: string }
  | { kind: "promise.register"; head: ResponseHead<429>; data: string }
  | { kind: "promise.register"; head: ResponseHead<500>; data: string };

export type PromiseSubscribeRes =
  | { kind: "promise.subscribe"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "promise.subscribe"; head: ResponseHead<400>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<404>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<429>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<500>; data: string }
  | { kind: "promise.subscribe"; head: ResponseHead<501>; data: string };

// =============================================================================
// RESPONSES - TASK
// =============================================================================

export type TaskGetRes =
  | { kind: "task.get"; head: ResponseHead<200>; data: { task: TaskRecord } }
  | { kind: "task.get"; head: ResponseHead<400>; data: string }
  | { kind: "task.get"; head: ResponseHead<404>; data: string }
  | { kind: "task.get"; head: ResponseHead<429>; data: string }
  | { kind: "task.get"; head: ResponseHead<500>; data: string };

export type TaskCreateRes =
  | { kind: "task.create"; head: ResponseHead<200>; data: { task: TaskRecord; promise: PromiseRecord } }
  | { kind: "task.create"; head: ResponseHead<400>; data: string }
  | { kind: "task.create"; head: ResponseHead<429>; data: string }
  | { kind: "task.create"; head: ResponseHead<500>; data: string }
  | { kind: "task.create"; head: ResponseHead<501>; data: string };

export type TaskAcquireRes =
  | { kind: "task.acquire"; head: ResponseHead<200>; data: { kind: "invoke" | "resume"; data: { promise: PromiseRecord; preload: PromiseRecord[] } } }
  | { kind: "task.acquire"; head: ResponseHead<400>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<404>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<409>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<429>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<500>; data: string };

export type TaskSuspendRes =
  | { kind: "task.suspend"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "task.suspend"; head: ResponseHead<300>; data: Record<string, never> }
  | { kind: "task.suspend"; head: ResponseHead<400>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<404>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<409>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<429>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<500>; data: string };

export type TaskFulfillRes =
  | { kind: "task.fulfill"; head: ResponseHead<200>; data: { promise: PromiseRecord } }
  | { kind: "task.fulfill"; head: ResponseHead<400>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<404>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<409>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<429>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<500>; data: string };

export type TaskReleaseRes =
  | { kind: "task.release"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "task.release"; head: ResponseHead<400>; data: string }
  | { kind: "task.release"; head: ResponseHead<404>; data: string }
  | { kind: "task.release"; head: ResponseHead<409>; data: string }
  | { kind: "task.release"; head: ResponseHead<429>; data: string }
  | { kind: "task.release"; head: ResponseHead<500>; data: string };

export type TaskFenceRes =
  | { kind: "task.fence"; head: ResponseHead<200>; data: { action: PromiseCreateRes | PromiseSettleRes } }
  | { kind: "task.fence"; head: ResponseHead<400>; data: string }
  | { kind: "task.fence"; head: ResponseHead<404>; data: string }
  | { kind: "task.fence"; head: ResponseHead<412>; data: string }
  | { kind: "task.fence"; head: ResponseHead<429>; data: string }
  | { kind: "task.fence"; head: ResponseHead<500>; data: string };

export type TaskHeartbeatRes =
  | { kind: "task.heartbeat"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "task.heartbeat"; head: ResponseHead<400>; data: string }
  | { kind: "task.heartbeat"; head: ResponseHead<429>; data: string }
  | { kind: "task.heartbeat"; head: ResponseHead<500>; data: string };

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

export type ScheduleCreateRes =
  | { kind: "schedule.create"; head: ResponseHead<200>; data: { schedule: ScheduleRecord } }
  | { kind: "schedule.create"; head: ResponseHead<400>; data: string }
  | { kind: "schedule.create"; head: ResponseHead<429>; data: string }
  | { kind: "schedule.create"; head: ResponseHead<500>; data: string }
  | { kind: "schedule.create"; head: ResponseHead<501>; data: string };

export type ScheduleDeleteRes =
  | { kind: "schedule.delete"; head: ResponseHead<200>; data: Record<string, never> }
  | { kind: "schedule.delete"; head: ResponseHead<400>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<404>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<429>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<500>; data: string }
  | { kind: "schedule.delete"; head: ResponseHead<501>; data: string };

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
  | ScheduleDeleteRes;

// =============================================================================
// MESSAGES
// =============================================================================

export type MessageHead = Record<string, never>;

export type InvokeMsg = {
  kind: "invoke";
  head: MessageHead;
  data: { task: Pick<TaskRecord, "id" | "version"> };
};

export type ResumeMsg = {
  kind: "resume";
  head: MessageHead;
  data: { task: Pick<TaskRecord, "id" | "version"> };
};

export type NotifyMsg = {
  kind: "notify";
  head: MessageHead;
  data: { promise: PromiseRecord };
};

export type Message = InvokeMsg | ResumeMsg | NotifyMsg;
