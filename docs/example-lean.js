// Which handler processes each step of the worked example, and which arm of
// that handler's match this particular message takes.
//
// `arm` is matched against the trimmed start of a line. `only` highlights just
// that line — used where the arrow itself shows a branch, so the decision
// point is the honest thing to point at rather than either outcome.
// null marks the steps that never reach the server.
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
  10: { handler: "taskFence", arm: "| .create r =>" },
  11: { handler: "promiseCreate", arm: "| none =>" },
  12: null,
  13: null,
  14: { handler: "taskSuspend", arm: "| some false =>" },
  15: { handler: "taskSuspend", arm: "| some false =>" },
  16: { handler: "processRetryTimeout", arm: 'setMessage ((p.tags.get? "resonate:target").getD "")' },
  17: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  18: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  19: null,
  20: null,
  21: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  22: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  23: { handler: "processRetryTimeout", arm: 'setMessage ((p.tags.get? "resonate:target").getD "")' },
  24: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  25: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  26: null,
  27: null,
  28: { handler: "taskFence", arm: "| .create r =>" },
  29: { handler: "promiseCreate", arm: "| some p =>" },
  30: null,
  31: null,
  32: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  33: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  34: { handler: "processListener", arm: "else if p.listeners.contains address then" },
};
