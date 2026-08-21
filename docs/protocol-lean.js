// The protocol page folds every pass into one loop, so several arrows show a
// branch rather than an outcome: pending | settled, suspend | fulfill,
// released | fulfilled. Where the arrow branches, the highlight falls on the
// match that decides it rather than on either arm — the diagram is showing
// both, and so is the handler.
export const LEAN = {
  1: { handler: "promiseCreate", arm: "| none =>" },
  2: { handler: "promiseCreate", arm: "| none =>" },
  3: { handler: "promiseRegisterListener", arm: "| some pAwaited =>" },
  4: { handler: "promiseRegisterListener", arm: "| some pAwaited =>" },
  5: { handler: "processRetryTimeout", arm: 'setMessage ((p.tags.get? "resonate:target").getD "")' },
  6: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  7: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  8: null,
  9: null,
  10: { handler: "taskFence", arm: "match req.action with", only: true },
  11: { handler: "promiseCreate", arm: "match ← readPromise req.id now with", only: true },
  12: null,
  13: null,
  14: { handler: "taskSuspend", arm: "match ← checkAwaited now req.actions with", only: true },
  15: { handler: "taskSuspend", arm: "match ← checkAwaited now req.actions with", only: true },
  16: { handler: "processListener", arm: "else if p.listeners.contains address then" },
};

// The message type each arrow carries, from spec/types-raw.ts. Where an arrow
// shows a branch it carries two, and both are named. The steps that cross the
// SDK boundary carry none, because they carry no message.
export const TYPES_FOR = {
  1: ["PromiseCreateReq"],
  2: ["PromiseCreateRes"],
  3: ["PromiseRegisterListenerReq"],
  4: ["PromiseRegisterListenerRes"],
  5: ["ExecuteMsg"],
  6: ["TaskAcquireReq"],
  7: ["TaskAcquireRes"],
  8: null,
  9: null,
  10: ["TaskFenceReq"],
  11: ["TaskFenceRes"],
  12: null,
  13: null,
  14: ["TaskSuspendReq", "TaskFulfillReq"],
  15: ["TaskSuspendRes", "TaskFulfillRes"],
  16: ["UnblockMsg"],
};
