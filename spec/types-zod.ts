import { z } from "zod";

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

export const ValueSchema = z.object({
  headers: z.record(z.string(), z.string()).optional(),
  data: z.string().optional(),
});

// =============================================================================
// RECORD SCHEMAS
// =============================================================================

export const PromiseRecordSchema = z.object({
  id: z.string(),
  state: z.enum(["pending", "resolved", "rejected", "rejected_canceled", "rejected_timedout"]),
  param: ValueSchema,
  value: ValueSchema,
  tags: z.record(z.string(), z.string()),
  timeoutAt: z.number(),
  createdAt: z.number(),
  settledAt: z.number().nullable(),
});

export const TaskRecordSchema = z.object({
  id: z.string(),
  state: z.enum(["pending", "acquired", "suspended", "fulfilled"]),
  version: z.number().int(),
});

export const ScheduleRecordSchema = z.object({
  id: z.string(),
  cron: z.string(),
  promiseId: z.string(),
  promiseTimeout: z.number(),
  promiseParam: ValueSchema,
  promiseTags: z.record(z.string(), z.string()),
  createdAt: z.number(),
  nextRunAt: z.number(),
  lastRunAt: z.number().nullable(),
});

// =============================================================================
// REQUEST HEAD
// =============================================================================

export const RequestHeadSchema = z.object({
  auth: z.string().optional(),
  corrId: z.string(),
  version: z.string(),
});

// =============================================================================
// REQUEST SCHEMAS - PROMISE
// =============================================================================

export const PromiseGetReqSchema = z.object({
  kind: z.literal("promise.get"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Promise ID is required"),
  }),
});

export type PromiseGetReq = z.infer<typeof PromiseGetReqSchema>;

export const PromiseCreateReqSchema = z.object({
  kind: z.literal("promise.create"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Promise ID is required"),
    timeoutAt: z.number().int().nonnegative("TimeoutAt must be a non-negative integer"),
    param: ValueSchema.optional(),
    tags: z.record(z.string(), z.string()).optional(),
  }),
});

export type PromiseCreateReq = z.infer<typeof PromiseCreateReqSchema>;

export const PromiseSettleReqSchema = z.object({
  kind: z.literal("promise.settle"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Promise ID is required"),
    state: z.enum(["resolved", "rejected", "rejected_canceled"]),
    value: ValueSchema.optional(),
  }),
});

export type PromiseSettleReq = z.infer<typeof PromiseSettleReqSchema>;

export const PromiseRegisterReqSchema = z.object({
  kind: z.literal("promise.register"),
  head: RequestHeadSchema,
  data: z.object({
    awaited: z.string().min(1, "Awaited promise ID is required"),
    awaiter: z.string().min(1, "Awaiter promise ID is required"),
  }),
});

export type PromiseRegisterReq = z.infer<typeof PromiseRegisterReqSchema>;

export const PromiseSubscribeReqSchema = z.object({
  kind: z.literal("promise.subscribe"),
  head: RequestHeadSchema,
  data: z.object({
    awaited: z.string().min(1, "Awaited promise ID is required"),
    address: z.string().min(1, "Address is required"),
  }),
});

export type PromiseSubscribeReq = z.infer<typeof PromiseSubscribeReqSchema>;

// =============================================================================
// REQUEST SCHEMAS - TASK
// =============================================================================

export const TaskGetReqSchema = z.object({
  kind: z.literal("task.get"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
  }),
});

export type TaskGetReq = z.infer<typeof TaskGetReqSchema>;

export const TaskCreateReqSchema = z.object({
  kind: z.literal("task.create"),
  head: RequestHeadSchema,
  data: z.object({
    pid: z.string().min(1, "Process ID is required"),
    ttl: z.number().int().positive("TTL must be a positive integer"),
    action: PromiseCreateReqSchema,
  }),
});

export type TaskCreateReq = z.infer<typeof TaskCreateReqSchema>;

export const TaskAcquireReqSchema = z.object({
  kind: z.literal("task.acquire"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
    version: z.number().int().nonnegative("Version must be a non-negative integer"),
    pid: z.string().min(1, "Process ID is required"),
    ttl: z.number().int().positive("TTL must be a positive integer"),
  }),
});

export type TaskAcquireReq = z.infer<typeof TaskAcquireReqSchema>;

export const TaskSuspendReqSchema = z.object({
  kind: z.literal("task.suspend"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
    version: z.number().int().nonnegative("Version must be a non-negative integer"),
    actions: z.array(PromiseRegisterReqSchema).nonempty("Actions array cannot be empty"),
  }).refine((r) => r.actions.every((a) => a.data.awaiter === r.id)),
});

export type TaskSuspendReq = z.infer<typeof TaskSuspendReqSchema>;

export const TaskFulfillReqSchema = z.object({
  kind: z.literal("task.fulfill"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
    version: z.number().int().nonnegative("Version must be a non-negative integer"),
    action: PromiseSettleReqSchema,
  }),
});

export type TaskFulfillReq = z.infer<typeof TaskFulfillReqSchema>;

export const TaskReleaseReqSchema = z.object({
  kind: z.literal("task.release"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
    version: z.number().int().nonnegative("Version must be a non-negative integer"),
  }),
});

export type TaskReleaseReq = z.infer<typeof TaskReleaseReqSchema>;

export const TaskFenceReqSchema = z.object({
  kind: z.literal("task.fence"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
    version: z.number().int().nonnegative("Version must be a non-negative integer"),
    action: z.discriminatedUnion("kind", [PromiseCreateReqSchema, PromiseSettleReqSchema]),
  }),
});

export type TaskFenceReq = z.infer<typeof TaskFenceReqSchema>;

export const TaskHeartbeatReqSchema = z.object({
  kind: z.literal("task.heartbeat"),
  head: RequestHeadSchema,
  data: z.object({
    pid: z.string().min(1, "Process ID is required"),
    tasks: z.array(z.object({ id: z.string(), version: z.number().int() })),
  }),
});

export type TaskHeartbeatReq = z.infer<typeof TaskHeartbeatReqSchema>;

// =============================================================================
// REQUEST SCHEMAS - SCHEDULE
// =============================================================================

export const ScheduleGetReqSchema = z.object({
  kind: z.literal("schedule.get"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Schedule ID is required"),
  }),
});

export type ScheduleGetReq = z.infer<typeof ScheduleGetReqSchema>;

export const ScheduleCreateReqSchema = z.object({
  kind: z.literal("schedule.create"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Schedule ID is required"),
    cron: z.string().min(1, "Cron expression is required"),
    promiseId: z.string().min(1, "Promise ID template is required"),
    promiseTimeout: z.number().int().nonnegative("Promise timeout must be a non-negative integer"),
    promiseParam: ValueSchema.optional(),
    promiseTags: z.record(z.string(), z.string()).optional(),
  }),
});

export type ScheduleCreateReq = z.infer<typeof ScheduleCreateReqSchema>;

export const ScheduleDeleteReqSchema = z.object({
  kind: z.literal("schedule.delete"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Schedule ID is required"),
  }),
});

export type ScheduleDeleteReq = z.infer<typeof ScheduleDeleteReqSchema>;

// =============================================================================
// REQUEST SCHEMAS - DEBUG
// =============================================================================

export const DebugStartReqSchema = z.object({
  kind: z.literal("debug.start"),
  head: RequestHeadSchema,
});

export type DebugStartReq = z.infer<typeof DebugStartReqSchema>;

export const DebugResetReqSchema = z.object({
  kind: z.literal("debug.reset"),
  head: RequestHeadSchema,
});

export type DebugResetReq = z.infer<typeof DebugResetReqSchema>;

export const DebugTickReqSchema = z.object({
  kind: z.literal("debug.tick"),
  head: RequestHeadSchema,
  data: z.object({
    time: z.number().int().nonnegative("Time must be a non-negative integer"),
  }),
});

export type DebugTickReq = z.infer<typeof DebugTickReqSchema>;

export const DebugSnapReqSchema = z.object({
  kind: z.literal("debug.snap"),
  head: RequestHeadSchema,
});

export type DebugSnapReq = z.infer<typeof DebugSnapReqSchema>;

export const DebugStopReqSchema = z.object({
  kind: z.literal("debug.stop"),
  head: RequestHeadSchema,
});

export type DebugStopReq = z.infer<typeof DebugStopReqSchema>;

// =============================================================================
// COMBINED REQUEST SCHEMA
// =============================================================================

export const RequestSchema = z.discriminatedUnion("kind", [
  // Promise
  PromiseGetReqSchema,
  PromiseCreateReqSchema,
  PromiseSettleReqSchema,
  PromiseRegisterReqSchema,
  PromiseSubscribeReqSchema,
  // Task
  TaskGetReqSchema,
  TaskCreateReqSchema,
  TaskAcquireReqSchema,
  TaskSuspendReqSchema,
  TaskFulfillReqSchema,
  TaskReleaseReqSchema,
  TaskFenceReqSchema,
  TaskHeartbeatReqSchema,
  // Schedule
  ScheduleGetReqSchema,
  ScheduleCreateReqSchema,
  ScheduleDeleteReqSchema,
  // Debug
  DebugStartReqSchema,
  DebugResetReqSchema,
  DebugTickReqSchema,
  DebugSnapReqSchema,
  DebugStopReqSchema,
]);

export type Request = z.infer<typeof RequestSchema>;

// =============================================================================
// RESPONSE HEAD
// =============================================================================

export const ResponseHeadSchema = <S extends number>(status: S) => z.object({
  corrId: z.string(),
  status: z.literal(status),
  version: z.string(),
});

// =============================================================================
// RESPONSE SCHEMAS - PROMISE
// =============================================================================

export const PromiseGetResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.get"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.get"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.get"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.get"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.get"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type PromiseGetRes = z.infer<typeof PromiseGetResSchema>;
export type PromiseGetRes200 = Extract<PromiseGetRes, { head: { status: 200 } }>;
export type PromiseGetRes400 = Extract<PromiseGetRes, { head: { status: 400 } }>;
export type PromiseGetRes404 = Extract<PromiseGetRes, { head: { status: 404 } }>;
export type PromiseGetRes429 = Extract<PromiseGetRes, { head: { status: 429 } }>;
export type PromiseGetRes500 = Extract<PromiseGetRes, { head: { status: 500 } }>;

export const PromiseCreateResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.create"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.create"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.create"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.create"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type PromiseCreateRes = z.infer<typeof PromiseCreateResSchema>;
export type PromiseCreateRes200 = Extract<PromiseCreateRes, { head: { status: 200 } }>;
export type PromiseCreateRes400 = Extract<PromiseCreateRes, { head: { status: 400 } }>;
export type PromiseCreateRes429 = Extract<PromiseCreateRes, { head: { status: 429 } }>;
export type PromiseCreateRes500 = Extract<PromiseCreateRes, { head: { status: 500 } }>;

export const PromiseSettleResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.settle"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.settle"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.settle"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.settle"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.settle"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type PromiseSettleRes = z.infer<typeof PromiseSettleResSchema>;
export type PromiseSettleRes200 = Extract<PromiseSettleRes, { head: { status: 200 } }>;
export type PromiseSettleRes400 = Extract<PromiseSettleRes, { head: { status: 400 } }>;
export type PromiseSettleRes404 = Extract<PromiseSettleRes, { head: { status: 404 } }>;
export type PromiseSettleRes429 = Extract<PromiseSettleRes, { head: { status: 429 } }>;
export type PromiseSettleRes500 = Extract<PromiseSettleRes, { head: { status: 500 } }>;

export const PromiseRegisterResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.register"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.register"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type PromiseRegisterRes = z.infer<typeof PromiseRegisterResSchema>;
export type PromiseRegisterRes200 = Extract<PromiseRegisterRes, { head: { status: 200 } }>;
export type PromiseRegisterRes400 = Extract<PromiseRegisterRes, { head: { status: 400 } }>;
export type PromiseRegisterRes404 = Extract<PromiseRegisterRes, { head: { status: 404 } }>;
export type PromiseRegisterRes429 = Extract<PromiseRegisterRes, { head: { status: 429 } }>;
export type PromiseRegisterRes500 = Extract<PromiseRegisterRes, { head: { status: 500 } }>;

export const PromiseSubscribeResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.subscribe"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.subscribe"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.subscribe"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.subscribe"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.subscribe"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.subscribe"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type PromiseSubscribeRes = z.infer<typeof PromiseSubscribeResSchema>;
export type PromiseSubscribeRes200 = Extract<PromiseSubscribeRes, { head: { status: 200 } }>;
export type PromiseSubscribeRes400 = Extract<PromiseSubscribeRes, { head: { status: 400 } }>;
export type PromiseSubscribeRes404 = Extract<PromiseSubscribeRes, { head: { status: 404 } }>;
export type PromiseSubscribeRes429 = Extract<PromiseSubscribeRes, { head: { status: 429 } }>;
export type PromiseSubscribeRes500 = Extract<PromiseSubscribeRes, { head: { status: 500 } }>;
export type PromiseSubscribeRes501 = Extract<PromiseSubscribeRes, { head: { status: 501 } }>;

// =============================================================================
// RESPONSE SCHEMAS - TASK
// =============================================================================

export const TaskGetResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.get"),
    head: ResponseHeadSchema(200),
    data: z.object({ task: TaskRecordSchema }),
  }),
  z.object({
    kind: z.literal("task.get"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.get"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.get"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.get"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskGetRes = z.infer<typeof TaskGetResSchema>;
export type TaskGetRes200 = Extract<TaskGetRes, { head: { status: 200 } }>;
export type TaskGetRes400 = Extract<TaskGetRes, { head: { status: 400 } }>;
export type TaskGetRes404 = Extract<TaskGetRes, { head: { status: 404 } }>;
export type TaskGetRes429 = Extract<TaskGetRes, { head: { status: 429 } }>;
export type TaskGetRes500 = Extract<TaskGetRes, { head: { status: 500 } }>;

export const TaskCreateResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(200),
    data: z.object({ task: TaskRecordSchema, promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type TaskCreateRes = z.infer<typeof TaskCreateResSchema>;
export type TaskCreateRes200 = Extract<TaskCreateRes, { head: { status: 200 } }>;
export type TaskCreateRes400 = Extract<TaskCreateRes, { head: { status: 400 } }>;
export type TaskCreateRes409 = Extract<TaskCreateRes, { head: { status: 409 } }>;
export type TaskCreateRes429 = Extract<TaskCreateRes, { head: { status: 429 } }>;
export type TaskCreateRes500 = Extract<TaskCreateRes, { head: { status: 500 } }>;
export type TaskCreateRes501 = Extract<TaskCreateRes, { head: { status: 501 } }>;

export const TaskAcquireResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(200),
    data: z.object({
      promise: PromiseRecordSchema,
      preload: z.array(PromiseRecordSchema),
    }),
  }),
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskAcquireRes = z.infer<typeof TaskAcquireResSchema>;
export type TaskAcquireRes200 = Extract<TaskAcquireRes, { head: { status: 200 } }>;
export type TaskAcquireRes400 = Extract<TaskAcquireRes, { head: { status: 400 } }>;
export type TaskAcquireRes404 = Extract<TaskAcquireRes, { head: { status: 404 } }>;
export type TaskAcquireRes409 = Extract<TaskAcquireRes, { head: { status: 409 } }>;
export type TaskAcquireRes429 = Extract<TaskAcquireRes, { head: { status: 429 } }>;
export type TaskAcquireRes500 = Extract<TaskAcquireRes, { head: { status: 500 } }>;

export const TaskSuspendResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(300),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskSuspendRes = z.infer<typeof TaskSuspendResSchema>;
export type TaskSuspendRes200 = Extract<TaskSuspendRes, { head: { status: 200 } }>;
export type TaskSuspendRes300 = Extract<TaskSuspendRes, { head: { status: 300 } }>;
export type TaskSuspendRes400 = Extract<TaskSuspendRes, { head: { status: 400 } }>;
export type TaskSuspendRes404 = Extract<TaskSuspendRes, { head: { status: 404 } }>;
export type TaskSuspendRes409 = Extract<TaskSuspendRes, { head: { status: 409 } }>;
export type TaskSuspendRes429 = Extract<TaskSuspendRes, { head: { status: 429 } }>;
export type TaskSuspendRes500 = Extract<TaskSuspendRes, { head: { status: 500 } }>;

export const TaskFulfillResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskFulfillRes = z.infer<typeof TaskFulfillResSchema>;
export type TaskFulfillRes200 = Extract<TaskFulfillRes, { head: { status: 200 } }>;
export type TaskFulfillRes400 = Extract<TaskFulfillRes, { head: { status: 400 } }>;
export type TaskFulfillRes404 = Extract<TaskFulfillRes, { head: { status: 404 } }>;
export type TaskFulfillRes409 = Extract<TaskFulfillRes, { head: { status: 409 } }>;
export type TaskFulfillRes429 = Extract<TaskFulfillRes, { head: { status: 429 } }>;
export type TaskFulfillRes500 = Extract<TaskFulfillRes, { head: { status: 500 } }>;

export const TaskReleaseResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskReleaseRes = z.infer<typeof TaskReleaseResSchema>;
export type TaskReleaseRes200 = Extract<TaskReleaseRes, { head: { status: 200 } }>;
export type TaskReleaseRes400 = Extract<TaskReleaseRes, { head: { status: 400 } }>;
export type TaskReleaseRes404 = Extract<TaskReleaseRes, { head: { status: 404 } }>;
export type TaskReleaseRes409 = Extract<TaskReleaseRes, { head: { status: 409 } }>;
export type TaskReleaseRes429 = Extract<TaskReleaseRes, { head: { status: 429 } }>;
export type TaskReleaseRes500 = Extract<TaskReleaseRes, { head: { status: 500 } }>;

export const TaskFenceResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(200),
    data: z.object({
      action: z.union([PromiseCreateResSchema, PromiseSettleResSchema]),
    }),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(412),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskFenceRes = z.infer<typeof TaskFenceResSchema>;
export type TaskFenceRes200 = Extract<TaskFenceRes, { head: { status: 200 } }>;
export type TaskFenceRes400 = Extract<TaskFenceRes, { head: { status: 400 } }>;
export type TaskFenceRes404 = Extract<TaskFenceRes, { head: { status: 404 } }>;
export type TaskFenceRes412 = Extract<TaskFenceRes, { head: { status: 412 } }>;
export type TaskFenceRes429 = Extract<TaskFenceRes, { head: { status: 429 } }>;
export type TaskFenceRes500 = Extract<TaskFenceRes, { head: { status: 500 } }>;

export const TaskHeartbeatResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.heartbeat"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.heartbeat"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.heartbeat"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.heartbeat"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskHeartbeatRes = z.infer<typeof TaskHeartbeatResSchema>;
export type TaskHeartbeatRes200 = Extract<TaskHeartbeatRes, { head: { status: 200 } }>;
export type TaskHeartbeatRes400 = Extract<TaskHeartbeatRes, { head: { status: 400 } }>;
export type TaskHeartbeatRes429 = Extract<TaskHeartbeatRes, { head: { status: 429 } }>;
export type TaskHeartbeatRes500 = Extract<TaskHeartbeatRes, { head: { status: 500 } }>;

// =============================================================================
// RESPONSE SCHEMAS - SCHEDULE
// =============================================================================

export const ScheduleGetResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(200),
    data: z.object({ schedule: ScheduleRecordSchema }),
  }),
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type ScheduleGetRes = z.infer<typeof ScheduleGetResSchema>;
export type ScheduleGetRes200 = Extract<ScheduleGetRes, { head: { status: 200 } }>;
export type ScheduleGetRes400 = Extract<ScheduleGetRes, { head: { status: 400 } }>;
export type ScheduleGetRes404 = Extract<ScheduleGetRes, { head: { status: 404 } }>;
export type ScheduleGetRes429 = Extract<ScheduleGetRes, { head: { status: 429 } }>;
export type ScheduleGetRes500 = Extract<ScheduleGetRes, { head: { status: 500 } }>;
export type ScheduleGetRes501 = Extract<ScheduleGetRes, { head: { status: 501 } }>;

export const ScheduleCreateResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("schedule.create"),
    head: ResponseHeadSchema(200),
    data: z.object({ schedule: ScheduleRecordSchema }),
  }),
  z.object({
    kind: z.literal("schedule.create"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.create"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.create"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.create"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type ScheduleCreateRes = z.infer<typeof ScheduleCreateResSchema>;
export type ScheduleCreateRes200 = Extract<ScheduleCreateRes, { head: { status: 200 } }>;
export type ScheduleCreateRes400 = Extract<ScheduleCreateRes, { head: { status: 400 } }>;
export type ScheduleCreateRes429 = Extract<ScheduleCreateRes, { head: { status: 429 } }>;
export type ScheduleCreateRes500 = Extract<ScheduleCreateRes, { head: { status: 500 } }>;
export type ScheduleCreateRes501 = Extract<ScheduleCreateRes, { head: { status: 501 } }>;

export const ScheduleDeleteResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type ScheduleDeleteRes = z.infer<typeof ScheduleDeleteResSchema>;
export type ScheduleDeleteRes200 = Extract<ScheduleDeleteRes, { head: { status: 200 } }>;
export type ScheduleDeleteRes400 = Extract<ScheduleDeleteRes, { head: { status: 400 } }>;
export type ScheduleDeleteRes404 = Extract<ScheduleDeleteRes, { head: { status: 404 } }>;
export type ScheduleDeleteRes429 = Extract<ScheduleDeleteRes, { head: { status: 429 } }>;
export type ScheduleDeleteRes500 = Extract<ScheduleDeleteRes, { head: { status: 500 } }>;
export type ScheduleDeleteRes501 = Extract<ScheduleDeleteRes, { head: { status: 501 } }>;

// =============================================================================
// RESPONSE SCHEMAS - DEBUG
// =============================================================================

export const DebugStartResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("debug.start"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("debug.start"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.start"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.start"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.start"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type DebugStartRes = z.infer<typeof DebugStartResSchema>;
export type DebugStartRes200 = Extract<DebugStartRes, { head: { status: 200 } }>;
export type DebugStartRes400 = Extract<DebugStartRes, { head: { status: 400 } }>;
export type DebugStartRes429 = Extract<DebugStartRes, { head: { status: 429 } }>;
export type DebugStartRes500 = Extract<DebugStartRes, { head: { status: 500 } }>;
export type DebugStartRes501 = Extract<DebugStartRes, { head: { status: 501 } }>;

export const DebugResetResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("debug.reset"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("debug.reset"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.reset"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.reset"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.reset"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type DebugResetRes = z.infer<typeof DebugResetResSchema>;
export type DebugResetRes200 = Extract<DebugResetRes, { head: { status: 200 } }>;
export type DebugResetRes400 = Extract<DebugResetRes, { head: { status: 400 } }>;
export type DebugResetRes429 = Extract<DebugResetRes, { head: { status: 429 } }>;
export type DebugResetRes500 = Extract<DebugResetRes, { head: { status: 500 } }>;
export type DebugResetRes501 = Extract<DebugResetRes, { head: { status: 501 } }>;

export const DebugTickActionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.settle"),
    data: z.object({
      id: z.string(),
      state: z.enum(["rejected_timedout", "resolved"]),
    }),
  }),
  z.object({
    kind: z.literal("task.release"),
    data: z.object({
      id: z.string(),
      version: z.number().int(),
    }),
  }),
  z.object({
    kind: z.literal("task.retry"),
    data: z.object({
      id: z.string(),
      version: z.number().int(),
    }),
  }),
]);

export type DebugTickAction = z.infer<typeof DebugTickActionSchema>;

export const DebugTickResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("debug.tick"),
    head: ResponseHeadSchema(200),
    data: z.array(DebugTickActionSchema),
  }),
  z.object({
    kind: z.literal("debug.tick"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.tick"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.tick"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.tick"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type DebugTickRes = z.infer<typeof DebugTickResSchema>;
export type DebugTickRes200 = Extract<DebugTickRes, { head: { status: 200 } }>;
export type DebugTickRes400 = Extract<DebugTickRes, { head: { status: 400 } }>;
export type DebugTickRes429 = Extract<DebugTickRes, { head: { status: 429 } }>;
export type DebugTickRes500 = Extract<DebugTickRes, { head: { status: 500 } }>;
export type DebugTickRes501 = Extract<DebugTickRes, { head: { status: 501 } }>;

export const DebugSnapResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(200),
    data: z.object({
      promises: z.array(PromiseRecordSchema),
      promiseTimeouts: z.array(z.object({ id: z.string(), timeout: z.number() })),
      tasks: z.array(TaskRecordSchema),
      taskTimeouts: z.array(z.object({ id: z.string(), type: z.number(), timeout: z.number() })),
      messages: z.array(z.object({ id: z.string(), version: z.number().int(), address: z.string() })),
    }),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type DebugSnapRes = z.infer<typeof DebugSnapResSchema>;
export type DebugSnapRes200 = Extract<DebugSnapRes, { head: { status: 200 } }>;
export type DebugSnapRes400 = Extract<DebugSnapRes, { head: { status: 400 } }>;
export type DebugSnapRes429 = Extract<DebugSnapRes, { head: { status: 429 } }>;
export type DebugSnapRes500 = Extract<DebugSnapRes, { head: { status: 500 } }>;
export type DebugSnapRes501 = Extract<DebugSnapRes, { head: { status: 501 } }>;

export const DebugStopResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("debug.stop"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("debug.stop"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.stop"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.stop"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.stop"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type DebugStopRes = z.infer<typeof DebugStopResSchema>;
export type DebugStopRes200 = Extract<DebugStopRes, { head: { status: 200 } }>;
export type DebugStopRes400 = Extract<DebugStopRes, { head: { status: 400 } }>;
export type DebugStopRes429 = Extract<DebugStopRes, { head: { status: 429 } }>;
export type DebugStopRes500 = Extract<DebugStopRes, { head: { status: 500 } }>;
export type DebugStopRes501 = Extract<DebugStopRes, { head: { status: 501 } }>;

// =============================================================================
// COMBINED RESPONSE SCHEMA
// =============================================================================

export const ResponseSchema = z.discriminatedUnion("kind", [
  // Promise
  PromiseGetResSchema,
  PromiseCreateResSchema,
  PromiseSettleResSchema,
  PromiseRegisterResSchema,
  PromiseSubscribeResSchema,
  // Task
  TaskGetResSchema,
  TaskCreateResSchema,
  TaskAcquireResSchema,
  TaskSuspendResSchema,
  TaskFulfillResSchema,
  TaskReleaseResSchema,
  TaskFenceResSchema,
  TaskHeartbeatResSchema,
  // Schedule
  ScheduleGetResSchema,
  ScheduleCreateResSchema,
  ScheduleDeleteResSchema,
  // Debug
  DebugStartResSchema,
  DebugResetResSchema,
  DebugTickResSchema,
  DebugSnapResSchema,
  DebugStopResSchema,
]);

export type Response = z.infer<typeof ResponseSchema>;

// =============================================================================
// MESSAGES
// =============================================================================

export const MessageHeadSchema = z.object({});

export const InvokeOrResumeMsgSchema = z.object({
  kind: z.literal("invoke_or_resume"),
  head: MessageHeadSchema,
  data: z.object({
    task: z.object({ id: z.string(), version: z.number().int() }),
  }),
});

export type InvokeOrResumeMsg = z.infer<typeof InvokeOrResumeMsgSchema>;

export const NotifyMsgSchema = z.object({
  kind: z.literal("notify"),
  head: MessageHeadSchema,
  data: z.object({
    promise: PromiseRecordSchema,
  }),
});

export type NotifyMsg = z.infer<typeof NotifyMsgSchema>;

export const MessageSchema = z.discriminatedUnion("kind", [
  InvokeOrResumeMsgSchema,
  NotifyMsgSchema,
]);

export type Message = z.infer<typeof MessageSchema>;
