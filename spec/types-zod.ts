import { z } from "zod";

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

export const ValueSchema = z.object({
  headers: z.record(z.string(), z.string()),
  data: z.string(),
});

// Protocol states for settlement requests
export const SettlementStateSchema = z.enum([
  "resolved",
  "rejected",
  "rejected_canceled",
]);

// All possible promise states
export const PromiseStateSchema = z.enum([
  "pending",
  "resolved",
  "rejected",
  "rejected_canceled",
  "rejected_timedout",
]);

// All possible task states
export const TaskStateSchema = z.enum([
  "pending",
  "acquired",
  "suspended",
  "fulfilled",
]);

// =============================================================================
// RECORD SCHEMAS
// =============================================================================

export const PromiseRecordSchema = z.object({
  id: z.string(),
  state: PromiseStateSchema,
  param: ValueSchema,
  value: ValueSchema,
  tags: z.record(z.string(), z.string()),
  timeoutAt: z.number(),
  createdAt: z.number(),
  settledAt: z.number().nullable(),
});

export const TaskRecordSchema = z.object({
  id: z.string(),
  state: TaskStateSchema,
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
    state: SettlementStateSchema,
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
    tasks: z.array(TaskRecordSchema.pick({ id: true, version: true })),
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

export const TaskAcquireResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(200),
    data: z.object({
      kind: z.enum(["invoke", "resume"]),
      data: z.object({
        promise: PromiseRecordSchema,
        preload: z.array(PromiseRecordSchema),
      }),
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
]);

export type Response = z.infer<typeof ResponseSchema>;

// =============================================================================
// MESSAGES
// =============================================================================

export const MessageHeadSchema = z.object({});

export const InvokeMsgSchema = z.object({
  kind: z.literal("invoke"),
  head: MessageHeadSchema,
  data: z.object({
    task: TaskRecordSchema.pick({ id: true, version: true }),
  }),
});

export type InvokeMsg = z.infer<typeof InvokeMsgSchema>;

export const ResumeMsgSchema = z.object({
  kind: z.literal("resume"),
  head: MessageHeadSchema,
  data: z.object({
    task: TaskRecordSchema.pick({ id: true, version: true }),
  }),
});

export type ResumeMsg = z.infer<typeof ResumeMsgSchema>;

export const NotifyMsgSchema = z.object({
  kind: z.literal("notify"),
  head: MessageHeadSchema,
  data: z.object({
    promise: PromiseRecordSchema,
  }),
});

export type NotifyMsg = z.infer<typeof NotifyMsgSchema>;

export const MessageSchema = z.discriminatedUnion("kind", [
  InvokeMsgSchema,
  ResumeMsgSchema,
  NotifyMsgSchema,
]);

export type Message = z.infer<typeof MessageSchema>;
