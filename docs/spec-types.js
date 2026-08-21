// Message types quoted verbatim from spec/types-raw.ts in this repository —
// the shapes the protocol page's arrows carry. The worked example shows an
// instance of each; this shows the type it is an instance of.

export const TYPES = {
  PromiseCreateReq: `export type PromiseCreateReq = {
  kind: "promise.create";
  head: RequestHead;
  data: {
    id: string;
    timeoutAt: number;
    param: Value;
    tags: Record<string, string>;
  };
};`,
  PromiseCreateRes: `export type PromiseCreateRes =
  | {
      kind: "promise.create";
      head: ResponseHead<200>;
      data: { promise: PromiseRecord };
    }
  | { kind: "promise.create"; head: ResponseHead<400>; data: string }
  | { kind: "promise.create"; head: ResponseHead<401>; data: string }
  | { kind: "promise.create"; head: ResponseHead<403>; data: string }
  | { kind: "promise.create"; head: ResponseHead<429>; data: string }
  | { kind: "promise.create"; head: ResponseHead<500>; data: string };`,
  PromiseRegisterListenerReq: `export type PromiseRegisterListenerReq = {
  kind: "promise.register_listener";
  head: RequestHead;
  data: {
    awaited: string;
    address: string;
  };
};`,
  PromiseRegisterListenerRes: `export type PromiseRegisterListenerRes =
  | {
      kind: "promise.register_listener";
      head: ResponseHead<200>;
      data: { promise: PromiseRecord };
    }
  | { kind: "promise.register_listener"; head: ResponseHead<400>; data: string }
  | { kind: "promise.register_listener"; head: ResponseHead<401>; data: string }
  | { kind: "promise.register_listener"; head: ResponseHead<403>; data: string }
  | { kind: "promise.register_listener"; head: ResponseHead<404>; data: string }
  | { kind: "promise.register_listener"; head: ResponseHead<429>; data: string }
  | { kind: "promise.register_listener"; head: ResponseHead<500>; data: string }
  | { kind: "promise.register_listener"; head: ResponseHead<501>; data: string };`,
  TaskAcquireReq: `export type TaskAcquireReq = {
  kind: "task.acquire";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    pid: string;
    ttl: number;
  };
};`,
  TaskAcquireRes: `export type TaskAcquireRes =
  | {
      kind: "task.acquire";
      head: ResponseHead<200>;
      data: { task: TaskRecord; promise: PromiseRecord; preload: PromiseRecord[] };
    }
  | { kind: "task.acquire"; head: ResponseHead<400>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<401>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<403>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<404>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<409>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<429>; data: string }
  | { kind: "task.acquire"; head: ResponseHead<500>; data: string };`,
  TaskFenceReq: `export type TaskFenceReq = {
  kind: "task.fence";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    action: PromiseCreateReq | PromiseSettleReq;
  };
};`,
  TaskFenceRes: `export type TaskFenceRes =
  | {
      kind: "task.fence";
      head: ResponseHead<200>;
      data: { action: PromiseCreateRes | PromiseSettleRes; preload: PromiseRecord[] };
    }
  | { kind: "task.fence"; head: ResponseHead<400>; data: string }
  | { kind: "task.fence"; head: ResponseHead<401>; data: string }
  | { kind: "task.fence"; head: ResponseHead<403>; data: string }
  | { kind: "task.fence"; head: ResponseHead<404>; data: string }
  | { kind: "task.fence"; head: ResponseHead<409>; data: string }
  | { kind: "task.fence"; head: ResponseHead<429>; data: string }
  | { kind: "task.fence"; head: ResponseHead<500>; data: string };`,
  TaskSuspendReq: `export type TaskSuspendReq = {
  kind: "task.suspend";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    actions: PromiseRegisterCallbackReq[];
  };
};`,
  TaskSuspendRes: `export type TaskSuspendRes =
  | {
      kind: "task.suspend";
      head: ResponseHead<200>;
      data: Record<string, never>;
    }
  | {
      kind: "task.suspend";
      head: ResponseHead<300>;
      data: { preload: PromiseRecord[] };
    }
  | { kind: "task.suspend"; head: ResponseHead<400>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<401>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<403>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<404>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<409>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<422>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<429>; data: string }
  | { kind: "task.suspend"; head: ResponseHead<500>; data: string };`,
  TaskFulfillReq: `export type TaskFulfillReq = {
  kind: "task.fulfill";
  head: RequestHead;
  data: {
    id: string;
    version: number;
    action: PromiseSettleReq;
  };
};`,
  TaskFulfillRes: `export type TaskFulfillRes =
  | {
      kind: "task.fulfill";
      head: ResponseHead<200>;
      data: { promise: PromiseRecord };
    }
  | { kind: "task.fulfill"; head: ResponseHead<400>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<401>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<403>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<404>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<409>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<429>; data: string }
  | { kind: "task.fulfill"; head: ResponseHead<500>; data: string };`,
  ExecuteMsg: `export type ExecuteMsg = {
  kind: "execute";
  head: MessageHead;
  data: { task: { id: string; version: number } };
};`,
  UnblockMsg: `export type UnblockMsg = {
  kind: "unblock";
  head: MessageHead;
  data: { promise: PromiseRecord };
};`,
};
