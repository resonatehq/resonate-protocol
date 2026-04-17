import { z } from "zod";

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

export const ValueSchema = z.object({
  headers: z.record(z.string(), z.string()).optional(),
  data: z.string().optional(),
});

export type Value = z.infer<typeof ValueSchema>;

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
  settledAt: z.number().optional(),
});

export type PromiseRecord = z.infer<typeof PromiseRecordSchema>;

export const TaskRecordSchema = z.object({
  id: z.string(),
  state: z.enum(["pending", "acquired", "suspended", "halted", "fulfilled"]),
  version: z.number().int(),
  resumes: z.union([z.array(z.string()), z.number().int(), z.boolean()]),
  ttl: z.number().int().optional(),
  pid: z.string().optional(),
});

export type TaskRecord = z.infer<typeof TaskRecordSchema>;

export const ScheduleRecordSchema = z.object({
  id: z.string(),
  cron: z.string(),
  promiseId: z.string(),
  promiseTimeout: z.number(),
  promiseParam: ValueSchema,
  promiseTags: z.record(z.string(), z.string()),
  createdAt: z.number(),
  nextRunAt: z.number(),
  lastRunAt: z.number().optional(),
});

export type ScheduleRecord = z.infer<typeof ScheduleRecordSchema>;

// =============================================================================
// MESSAGES
// =============================================================================

export const MessageHeadSchema = z.object({ serverUrl: z.string().optional() });

export const ExecuteMsgSchema = z.object({
  kind: z.literal("execute"),
  head: MessageHeadSchema,
  data: z.object({
    task: z.object({ id: z.string(), version: z.number().int() }),
  }),
});

export type ExecuteMsg = z.infer<typeof ExecuteMsgSchema>;

export const UnblockMsgSchema = z.object({
  kind: z.literal("unblock"),
  head: MessageHeadSchema,
  data: z.object({
    promise: PromiseRecordSchema,
  }),
});

export type UnblockMsg = z.infer<typeof UnblockMsgSchema>;

export const MessageSchema = z.discriminatedUnion("kind", [ExecuteMsgSchema, UnblockMsgSchema]);

export type Message = z.infer<typeof MessageSchema>;

// =============================================================================
// REQUEST HEAD
// =============================================================================

export const RequestHeadSchema = z.object({
  auth: z.string().optional(),
  corrId: z.string(),
  version: z.string(),
  "resonate:origin": z.string().optional(),
  "resonate:debug_time": z.number().int().nonnegative().optional(),
});

export type RequestHead = z.infer<typeof RequestHeadSchema>;

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

export const PromiseCreateReqSchema = z
  .object({
    kind: z.literal("promise.create"),
    head: RequestHeadSchema,
    data: z.object({
      id: z
        .string()
        .min(1, "Promise ID is required")
        .refine((s) => !s.includes("\x00"), "Promise ID must not contain null bytes"),
      timeoutAt: z.number().int().nonnegative("TimeoutAt must be a non-negative integer"),
      param: ValueSchema,
      tags: z.record(z.string(), z.string()),
    }),
  })
  .refine(
    (r) =>
      r.head["resonate:origin"] === undefined ||
      r.data.tags["resonate:origin"] === undefined ||
      r.head["resonate:origin"] === r.data.tags["resonate:origin"],
    { message: "head resonate:origin must match data.tags resonate:origin when both are present" },
  );

export type PromiseCreateReq = z.infer<typeof PromiseCreateReqSchema>;

export const PromiseSettleReqSchema = z.object({
  kind: z.literal("promise.settle"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Promise ID is required"),
    state: z.enum(["resolved", "rejected", "rejected_canceled"]),
    value: ValueSchema,
  }),
});

export type PromiseSettleReq = z.infer<typeof PromiseSettleReqSchema>;

export const PromiseRegisterCallbackReqSchema = z.object({
  kind: z.literal("promise.register_callback"),
  head: RequestHeadSchema,
  data: z
    .object({
      awaited: z.string().min(1, "Awaited promise ID is required"),
      awaiter: z.string().min(1, "Awaiter promise ID is required"),
    })
    .refine((d) => d.awaited !== d.awaiter, {
      message: "Awaited and awaiter must be different promises",
    }),
});

export type PromiseRegisterCallbackReq = z.infer<typeof PromiseRegisterCallbackReqSchema>;

export const PromiseRegisterListenerReqSchema = z.object({
  kind: z.literal("promise.register_listener"),
  head: RequestHeadSchema,
  data: z.object({
    awaited: z.string().min(1, "Awaited promise ID is required"),
    address: z.string().min(1, "Address is required"),
  }),
});

export type PromiseRegisterListenerReq = z.infer<typeof PromiseRegisterListenerReqSchema>;

export const PromiseSearchReqSchema = z.object({
  kind: z.literal("promise.search"),
  head: RequestHeadSchema,
  data: z.object({
    state: z.enum(["pending", "resolved", "rejected", "rejected_canceled", "rejected_timedout"]).optional(),
    tags: z.record(z.string(), z.string()).optional(),
    limit: z.number().int().positive("Limit must be a positive integer").optional(),
    cursor: z.string().optional(),
  }),
});

export type PromiseSearchReq = z.infer<typeof PromiseSearchReqSchema>;

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

export const TaskCreateReqSchema = z
  .object({
    kind: z.literal("task.create"),
    head: RequestHeadSchema,
    data: z
      .object({
        pid: z.string().min(1, "Process ID is required"),
        ttl: z.number().int().positive("TTL must be a positive integer"),
        action: PromiseCreateReqSchema,
      })
      .refine((r) => "resonate:target" in r.action.data.tags, {
        message: "Action must have a resonate:target tag",
      }),
  })
  .refine(
    (r) =>
      r.head["resonate:origin"] === undefined ||
      r.data.action.data.tags["resonate:origin"] === undefined ||
      r.head["resonate:origin"] === r.data.action.data.tags["resonate:origin"],
    { message: "head resonate:origin must match data.action.data.tags resonate:origin when both are present" },
  );

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

export const TaskReleaseReqSchema = z.object({
  kind: z.literal("task.release"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
    version: z.number().int().nonnegative("Version must be a non-negative integer"),
  }),
});

export type TaskReleaseReq = z.infer<typeof TaskReleaseReqSchema>;

export const TaskSuspendReqSchema = z.object({
  kind: z.literal("task.suspend"),
  head: RequestHeadSchema,
  data: z
    .object({
      id: z.string().min(1, "Task ID is required"),
      version: z.number().int().nonnegative("Version must be a non-negative integer"),
      actions: z.array(PromiseRegisterCallbackReqSchema).nonempty("Actions array cannot be empty"),
    })
    .refine((r) => r.actions.every((a) => a.data.awaiter === r.id), {
      message: "All action awaiter IDs must match the task ID",
    })
    .refine((r) => r.actions.every((a) => a.data.awaited !== r.id), {
      message: "Action awaited promise must not equal the task ID",
    }),
});

export type TaskSuspendReq = z.infer<typeof TaskSuspendReqSchema>;

export const TaskHaltReqSchema = z.object({
  kind: z.literal("task.halt"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
  }),
});

export type TaskHaltReq = z.infer<typeof TaskHaltReqSchema>;

export const TaskContinueReqSchema = z.object({
  kind: z.literal("task.continue"),
  head: RequestHeadSchema,
  data: z.object({
    id: z.string().min(1, "Task ID is required"),
  }),
});

export type TaskContinueReq = z.infer<typeof TaskContinueReqSchema>;

export const TaskFulfillReqSchema = z.object({
  kind: z.literal("task.fulfill"),
  head: RequestHeadSchema,
  data: z
    .object({
      id: z.string().min(1, "Task ID is required"),
      version: z.number().int().nonnegative("Version must be a non-negative integer"),
      action: PromiseSettleReqSchema,
    })
    .refine((r) => r.action.data.id === r.id, {
      message: "Action ID must match the task ID",
    }),
});

export type TaskFulfillReq = z.infer<typeof TaskFulfillReqSchema>;

export const TaskFenceReqSchema = z
  .object({
    kind: z.literal("task.fence"),
    head: RequestHeadSchema,
    data: z.object({
      id: z.string().min(1, "Task ID is required"),
      version: z.number().int().nonnegative("Version must be a non-negative integer"),
      action: z.discriminatedUnion("kind", [PromiseCreateReqSchema, PromiseSettleReqSchema]),
    }),
  })
  .refine(
    (r) =>
      r.data.action.kind !== "promise.create" ||
      r.data.action.head["resonate:origin"] === undefined ||
      r.data.action.data.tags["resonate:origin"] === undefined ||
      r.data.action.head["resonate:origin"] === r.data.action.data.tags["resonate:origin"],
    { message: "action head resonate:origin must match action data.tags resonate:origin when both are present" },
  );

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

export const TaskSearchReqSchema = z.object({
  kind: z.literal("task.search"),
  head: RequestHeadSchema,
  data: z.object({
    state: z.enum(["pending", "acquired", "suspended", "halted", "fulfilled"]).optional(),
    limit: z.number().int().positive("Limit must be a positive integer").optional(),
    cursor: z.string().optional(),
  }),
});

export type TaskSearchReq = z.infer<typeof TaskSearchReqSchema>;

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
    cron: z
      .string()
      .min(1, "Cron expression is required")
      .refine((v) => v.trim().split(/\s+/).length >= 5, "Cron expression must have at least 5 fields"),
    promiseId: z.string().min(1, "Promise ID template is required"),
    promiseTimeout: z.number().int().nonnegative("Promise timeout must be a non-negative integer"),
    promiseParam: ValueSchema,
    promiseTags: z.record(z.string(), z.string()),
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

export const ScheduleSearchReqSchema = z.object({
  kind: z.literal("schedule.search"),
  head: RequestHeadSchema,
  data: z.object({
    tags: z.record(z.string(), z.string()).optional(),
    limit: z.number().int().positive("Limit must be a positive integer").optional(),
    cursor: z.string().optional(),
  }),
});

export type ScheduleSearchReq = z.infer<typeof ScheduleSearchReqSchema>;

// =============================================================================
// REQUEST SCHEMAS - DEBUG
// =============================================================================

export const DebugStartReqSchema = z.object({
  kind: z.literal("debug.start"),
  head: RequestHeadSchema,
  data: z.object({}),
});

export type DebugStartReq = z.infer<typeof DebugStartReqSchema>;

export const DebugResetReqSchema = z.object({
  kind: z.literal("debug.reset"),
  head: RequestHeadSchema,
  data: z.object({}),
});

export type DebugResetReq = z.infer<typeof DebugResetReqSchema>;

export const DebugTickReqSchema = z
  .object({
    kind: z.literal("debug.tick"),
    head: RequestHeadSchema,
    data: z.object({
      time: z.number().int().nonnegative("Time must be a non-negative integer"),
    }),
  })
  .refine((r) => r.head["resonate:debug_time"] === undefined || r.head["resonate:debug_time"] === r.data.time, {
    message: "data.time must equal resonate:debug_time header when present",
  });

export type DebugTickReq = z.infer<typeof DebugTickReqSchema>;

export const DebugSnapReqSchema = z.object({
  kind: z.literal("debug.snap"),
  head: RequestHeadSchema,
  data: z.object({}),
});

export type DebugSnapReq = z.infer<typeof DebugSnapReqSchema>;

export const DebugStopReqSchema = z.object({
  kind: z.literal("debug.stop"),
  head: RequestHeadSchema,
  data: z.object({}),
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
  PromiseRegisterCallbackReqSchema,
  PromiseRegisterListenerReqSchema,
  PromiseSearchReqSchema,
  // Task
  TaskGetReqSchema,
  TaskCreateReqSchema,
  TaskAcquireReqSchema,
  TaskReleaseReqSchema,
  TaskSuspendReqSchema,
  TaskHaltReqSchema,
  TaskContinueReqSchema,
  TaskFulfillReqSchema,
  TaskFenceReqSchema,
  TaskHeartbeatReqSchema,
  TaskSearchReqSchema,
  // Schedule
  ScheduleGetReqSchema,
  ScheduleCreateReqSchema,
  ScheduleDeleteReqSchema,
  ScheduleSearchReqSchema,
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

export const ResponseHeadSchema = <S extends number>(status: S) =>
  z.object({
    corrId: z.string(),
    status: z.literal(status),
    version: z.string(),
  });

export type ResponseHead<S extends number> = z.infer<ReturnType<typeof ResponseHeadSchema<S>>>;

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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.get"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.create"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.settle"),
    head: ResponseHeadSchema(403),
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

export const PromiseRegisterCallbackResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(422),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_callback"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type PromiseRegisterCallbackRes = z.infer<typeof PromiseRegisterCallbackResSchema>;

export const PromiseRegisterListenerResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(200),
    data: z.object({ promise: PromiseRecordSchema }),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.register_listener"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type PromiseRegisterListenerRes = z.infer<typeof PromiseRegisterListenerResSchema>;

export const PromiseSearchResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(200),
    data: z.object({
      promises: z.array(PromiseRecordSchema),
      cursor: z.string().optional(),
    }),
  }),
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("promise.search"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type PromiseSearchRes = z.infer<typeof PromiseSearchResSchema>;

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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.get"),
    head: ResponseHeadSchema(403),
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
    data: z.object({
      task: TaskRecordSchema,
      promise: PromiseRecordSchema,
      preload: z.array(PromiseRecordSchema),
    }),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.create"),
    head: ResponseHeadSchema(422),
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
      task: TaskRecordSchema,
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.acquire"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.release"),
    head: ResponseHeadSchema(403),
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

export const TaskSuspendResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(300),
    data: z.object({ preload: z.array(PromiseRecordSchema) }),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.suspend"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(422),
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

export const TaskHaltResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.halt"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskHaltRes = z.infer<typeof TaskHaltResSchema>;

export const TaskContinueResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(200),
    data: z.object({}),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(409),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.continue"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
]);

export type TaskContinueRes = z.infer<typeof TaskContinueResSchema>;

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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fulfill"),
    head: ResponseHeadSchema(403),
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

export const TaskFenceResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(200),
    data: z.object({
      action: z.union([PromiseCreateResSchema, PromiseSettleResSchema]),
      preload: z.array(PromiseRecordSchema),
    }),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(404),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.fence"),
    head: ResponseHeadSchema(409),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.heartbeat"),
    head: ResponseHeadSchema(403),
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

export const TaskSearchResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(200),
    data: z.object({
      tasks: z.array(TaskRecordSchema),
      cursor: z.string().optional(),
    }),
  }),
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("task.search"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type TaskSearchRes = z.infer<typeof TaskSearchResSchema>;

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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.get"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.create"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.delete"),
    head: ResponseHeadSchema(403),
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

export const ScheduleSearchResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(200),
    data: z.object({
      schedules: z.array(ScheduleRecordSchema),
      cursor: z.string().optional(),
    }),
  }),
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(403),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(429),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(500),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("schedule.search"),
    head: ResponseHeadSchema(501),
    data: z.string(),
  }),
]);

export type ScheduleSearchRes = z.infer<typeof ScheduleSearchResSchema>;

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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.start"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.reset"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.tick"),
    head: ResponseHeadSchema(403),
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

export const DebugSnapResSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(200),
    data: z.object({
      promises: z.array(PromiseRecordSchema),
      promiseTimeouts: z.array(z.object({ id: z.string(), timeout: z.number() })),
      callbacks: z.array(z.object({ awaiter: z.string(), awaited: z.string() })),
      listeners: z.array(z.object({ id: z.string(), address: z.string() })).optional(),
      tasks: z.array(TaskRecordSchema),
      taskTimeouts: z.array(z.object({ id: z.string(), type: z.number(), timeout: z.number() })),
      schedules: z.array(ScheduleRecordSchema).optional(),
      scheduleTimeouts: z.array(z.object({ id: z.string(), timeout: z.number() })).optional(),
      messages: z.array(z.object({ address: z.string(), message: MessageSchema })),
    }),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(400),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.snap"),
    head: ResponseHeadSchema(403),
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
    head: ResponseHeadSchema(401),
    data: z.string(),
  }),
  z.object({
    kind: z.literal("debug.stop"),
    head: ResponseHeadSchema(403),
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

// =============================================================================
// COMBINED RESPONSE SCHEMA
// =============================================================================

export const ResponseSchema = z.discriminatedUnion("kind", [
  // Promise
  PromiseGetResSchema,
  PromiseCreateResSchema,
  PromiseSettleResSchema,
  PromiseRegisterCallbackResSchema,
  PromiseRegisterListenerResSchema,
  PromiseSearchResSchema,
  // Task
  TaskGetResSchema,
  TaskCreateResSchema,
  TaskAcquireResSchema,
  TaskReleaseResSchema,
  TaskSuspendResSchema,
  TaskHaltResSchema,
  TaskContinueResSchema,
  TaskFulfillResSchema,
  TaskFenceResSchema,
  TaskHeartbeatResSchema,
  TaskSearchResSchema,
  // Schedule
  ScheduleGetResSchema,
  ScheduleCreateResSchema,
  ScheduleDeleteResSchema,
  ScheduleSearchResSchema,
  // Debug
  DebugStartResSchema,
  DebugResetResSchema,
  DebugTickResSchema,
  DebugSnapResSchema,
  DebugStopResSchema,
]);

export type Response = z.infer<typeof ResponseSchema>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isSuccess<T extends Response>(res: T): res is Extract<T, { head: { status: 200 } }> {
  return res.head.status === 200;
}

export function isRedirect<T extends Response>(res: T): res is Extract<T, { head: { status: 300 } }> {
  return res.head.status === 300;
}

export function isBadRequest<T extends Response>(res: T): res is Extract<T, { head: { status: 400 } }> {
  return res.head.status === 400;
}

export function isUnauthorized<T extends Response>(res: T): res is Extract<T, { head: { status: 401 } }> {
  return res.head.status === 401;
}

export function isForbidden<T extends Response>(res: T): res is Extract<T, { head: { status: 403 } }> {
  return res.head.status === 403;
}

export function isNotFound<T extends Response>(res: T): res is Extract<T, { head: { status: 404 } }> {
  return res.head.status === 404;
}

export function isConflict<T extends Response>(res: T): res is Extract<T, { head: { status: 409 } }> {
  return res.head.status === 409;
}

export function isUnprocessable<T extends Response>(res: T): res is Extract<T, { head: { status: 422 } }> {
  return res.head.status === 422;
}

export function isRateLimited<T extends Response>(res: T): res is Extract<T, { head: { status: 429 } }> {
  return res.head.status === 429;
}

export function isError<T extends Response>(res: T): res is Extract<T, { head: { status: 500 } }> {
  return res.head.status === 500;
}

export function isNotImplemented<T extends Response>(res: T): res is Extract<T, { head: { status: 501 } }> {
  return res.head.status === 501;
}
