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
  3: { handler: "processRetryTimeout", arm: 'setMessage ((p.tags.get? "resonate:target").getD "")' },
  4: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  5: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  6: null,
  7: null,
  8: { handler: "taskFence", arm: "| .create r =>" },
  9: { handler: "promiseCreate", arm: "| none =>" },
  10: null,
  11: null,
  12: { handler: "taskSuspend", arm: "| some false =>" },
  13: { handler: "taskSuspend", arm: "| some false =>" },
  14: { handler: "processRetryTimeout", arm: 'setMessage ((p.tags.get? "resonate:target").getD "")' },
  15: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  16: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  17: null,
  18: null,
  19: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  20: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  21: { handler: "processRetryTimeout", arm: 'setMessage ((p.tags.get? "resonate:target").getD "")' },
  22: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  23: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  24: null,
  25: null,
  26: { handler: "taskFence", arm: "| .create r =>" },
  27: { handler: "promiseCreate", arm: "| some p =>" },
  28: null,
  29: null,
  30: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  31: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  32: { handler: "processListener", arm: "else if p.listeners.contains address then" },
};
