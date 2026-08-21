// Handlers quoted verbatim from resonatehq/resonate-specification —
// spec/02-abstract/external.lean and internal.lean, the abstract model where
// every protocol operation is a pure function from environment to response.
//
// Each step names the handler that processes its message and the arm of that
// handler's match that this particular message takes.

export const HANDLERS = {
  promiseCreate: {
    file: "external",
    src: `def promiseCreate (req : PromiseCreateReq) (now : Nat) : H PromiseCreateRes := do
  if req.tags.timerTargeted then
    return { status := 400, promise := none }
  match ← readPromise req.id now with
  | some p =>
      return { status := 200, promise := some p.toRecord }
  | none =>
      let p ← createPromise req now
      return { status := 200, promise := some p.toRecord }`,
  },
  taskAcquire: {
    file: "external",
    src: `def taskAcquire (req : TaskAcquireReq) (now : Nat) : H TaskAcquireRes := do
  match ← readTask req.id now with
  | none =>
      return { status := 404 }
  | some (_, none) =>
      return { status := 409 }
  | some (t, some p) =>
      if t.state != .pending then
        return { status := 409 }
      if p.state != .pending then
        return { status := 409 }
      if t.version != req.version then
        return { status := 409 }
      let t := { t with state := .acquired, version := t.version + 1,
                        ttl := some req.ttl, pid := some req.pid,
                        expiresAt := some (now + req.ttl),
                        retryAt := none, resumes := [] }
      setTask t
      return { status := 200, task := some t.toRecord, promise := some p.toRecord }`,
  },
  taskFence: {
    file: "external",
    src: `def taskFence (req : TaskFenceReq) (now : Nat) : H TaskFenceRes := do
  if req.action.targetId == req.id then
    return { status := 400 }
  match ← readTask req.id now with
  | none =>
      return { status := 404 }
  | some (_, none) =>
      return { status := 409 }
  | some (t, some p) =>
      if t.state != .acquired then
        return { status := 409 }
      if p.state != .pending then
        return { status := 409 }
      if t.version != req.version then
        return { status := 409 }
      match req.action with
      | .create r =>
          let res ← promiseCreate r now
          return { status := 200, action := some (.create res) }
      | .settle r =>
          let res ← promiseSettle r now
          return { status := 200, action := some (.settle res) }`,
  },
  taskSuspend: {
    file: "external",
    src: `def taskSuspend (req : TaskSuspendReq) (now : Nat) : H TaskSuspendRes := do
  if req.actions.isEmpty then
    return { status := 400 }
  if req.actions.any (·.awaited == req.id) then
    return { status := 400 }
  let awaitedIds := req.actions.map (·.awaited)
  if awaitedIds.eraseDups.length != awaitedIds.length then
    return { status := 400 }
  match ← readTask req.id now with
  | none =>
      return { status := 404 }
  | some (_, none) =>
      return { status := 409 }
  | some (t, some tp) =>
      if t.state != .acquired then
        return { status := 409 }
      if tp.state != .pending then
        return { status := 409 }
      if t.version != req.version then
        return { status := 409 }
      match ← checkAwaited now req.actions with
      | none =>
          return { status := 422 }
      | some true =>
          setTask { t with resumes := [] }
          return { status := 300 }
      | some false =>
          registerAwaited req.id now req.actions
          setTask { t with state := .suspended, pid := none, ttl := none,
                           expiresAt := none, retryAt := none, resumes := [] }
          return { status := 200 }`,
  },
  taskFulfill: {
    file: "external",
    src: `def taskFulfill (req : TaskFulfillReq) (now : Nat) : H TaskFulfillRes := do
  if !req.action.state.settable then
    return { status := 400 }
  match ← readTask req.id now with
  | none =>
      return { status := 404 }
  | some (_, none) =>
      return { status := 409 }
  | some (t, some p) =>
      if t.state != .acquired then
        return { status := 409 }
      if p.state != .pending then
        return { status := 409 }
      if t.version != req.version then
        return { status := 409 }
      let p := { p with state := req.action.state, value := req.action.value,
                        settledAt := some now }
      setSettled p
      return { status := 200, promise := some p.toRecord }`,
  },
  processCallback: {
    file: "internal",
    src: `def processCallback (id : String) (awaiter : String) (now : Nat) : H Unit := do
  match ← touchPromise id now with
  | none => pure ()
  | some p =>
      if p.state == .pending then
        pure ()
      else if p.callbacks.contains awaiter then
        setPromise { p with callbacks := p.callbacks.filter (· != awaiter) }
        resumeOne p.id awaiter now`,
  },
  resumeOne: {
    file: "internal",
    src: `def resumeOne (awaited awaiter : String) (now : Nat) : H Unit := do
  match ← touchTask awaiter now with
  | none => pure ()
  | some (_, none) => pure ()
  | some (t, some _) =>
      match t.state with
      | .suspended =>
          setTask { t with state := .pending, resumes := [awaited],
                           retryAt := some now }
      | .pending | .acquired | .halted =>
          if !(t.resumes.contains awaited) then
            setTask { t with resumes := t.resumes ++ [awaited] }
      | .fulfilled =>
          pure ()`,
  },
  processListener: {
    file: "internal",
    src: `def processListener (id : String) (address : String) (now : Nat) : H Unit := do
  match ← touchPromise id now with
  | none => pure ()
  | some p =>
      if p.state == .pending then
        pure ()
      else if p.listeners.contains address then
        setPromise { p with listeners := p.listeners.filter (· != address) }
        setMessage address (.unblock p.toRecord)`,
  },
};

// step -> the handler that processes its message, and the arm it takes.
// `arm` is matched against the trimmed start of a line; `nth` picks between
// repeats. null marks the steps that never reach the server.
export const LEAN = {
  1: { handler: "promiseCreate", arm: "| none =>" },
  2: { handler: "promiseCreate", arm: "| none =>" },
  3: { handler: "resumeOne", arm: "| .suspended =>" },
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
  14: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  15: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  16: { handler: "taskAcquire", arm: "| some (t, some p) =>" },
  17: null,
  18: null,
  19: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  20: { handler: "taskFulfill", arm: "| some (t, some p) =>" },
  21: { handler: "processCallback", arm: "else if p.callbacks.contains awaiter then" },
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
