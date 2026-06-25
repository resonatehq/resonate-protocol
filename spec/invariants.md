# Invariants

**State invariants** hold at every state in isolation. **Temporal invariants** hold between any two consecutive states, where S denotes the current state and S' denotes the immediately preceding state.

## Symbols

| Symbol             | Description                                       |
| ------------------ | ------------------------------------------------- |
| S                  | Current state                                     |
| S'                 | Previous state                                    |
| promise(t)         | The promise with id = t.id                        |
| task(p)            | The task with id = p.id                           |
| callbacks(p)       | The set of callback awaiter ids on promise p      |
| listeners(p)       | The set of listeners registered on promise p      |
| origin(p)          | The origin of promise p's id                      |
| prefix(a, b)       | a is a segment-prefix of b: b = a ∨ b starts with a ++ "."           |

## State

A **state** is defined as the tuple of all collections:

S = (Promises, Tasks, Schedules, PromiseTimeouts, TaskTimeouts, ScheduleTimeouts, Messages)

| Set               | Description                             |
| ----------------- | --------------------------------------- |
| Promises          | The set of all promises                 |
| Tasks             | The set of all tasks                    |
| Schedules         | The set of all schedules                |
| PromiseTimeouts   | The set of all promise timeout entries  |
| TaskTimeouts      | The set of all task timeout entries     |
| ScheduleTimeouts  | The set of all schedule timeout entries |
| Messages          | The set of all messages                 |

The primed variants (Promises', Tasks', etc.) denote the corresponding components of the previous state S'.

## Predicates

### Promise

| Predicate             | Definition                                                            |
| --------------------- | --------------------------------------------------------------------- |
| Pending(p)            | p.state = "pending"                                                   |
| Resolved(p)           | p.state = "resolved"                                                  |
| Rejected(p)           | p.state = "rejected"                                                  |
| Timedout(p)           | p.state = "rejected_timedout"                                         |
| Settled(p)            | p.state ∈ {resolved, rejected, rejected_canceled, rejected_timedout} |
| HasTarget(p)          | "resonate:target" ∈ p.tags                                            |
| HasTimer(p)           | "resonate:timer" ∈ p.tags                                             |
| HasDelay(p)           | "resonate:delay" ∈ p.tags                                             |
| HasSchedule(p)        | "resonate:schedule" ∈ p.tags                                          |
| HasTask(p)            | ∃ t ∈ Tasks : t.id = p.id                                             |
| HasPromiseTimeout(p)  | ∃ pt ∈ PromiseTimeouts : pt.id = p.id                                 |

### Task

| Predicate             | Definition                                                        |
| --------------------- | ----------------------------------------------------------------- |
| Pending(t)            | t.state = "pending"                                               |
| Acquired(t)           | t.state = "acquired"                                              |
| Suspended(t)          | t.state = "suspended"                                             |
| Halted(t)             | t.state = "halted"                                                |
| Fulfilled(t)          | t.state = "fulfilled"                                             |
| HasTimeout(t)         | ∃ tt ∈ TaskTimeouts : tt.id = t.id                                |
| HasLeaseTimeout(t)    | ∃ tt ∈ TaskTimeouts : tt.id = t.id ∧ tt.type = 1                 |
| HasRetryTimeout(t)    | ∃ tt ∈ TaskTimeouts : tt.id = t.id ∧ tt.type = 0                 |
| HasExecuteMessage(t)  | ∃ m ∈ Messages : m.kind = "execute" ∧ m.task.id = t.id           |

## Promise Invariants

### State

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| P1  | ∀ p, q ∈ Promises : p.id = q.id → p = q                                                                                   | Promise ids are unique.                                                        |
| P2  | ∀ p ∈ Promises : p.timeoutAt ≥ 0                                                                                           | Promise timeout is non-negative.                                               |
| P3  | ∀ p ∈ Promises : p.createdAt ≤ p.timeoutAt                                                                                 | Promise is created at or before its timeout.                                   |
| P4  | ∀ p ∈ Promises : Pending(p) → p.settledAt = ⊥                                                                             | Pending promises have no settled timestamp.                                    |
| P5  | ∀ p ∈ Promises : Settled(p) → p.createdAt ≤ p.settledAt                                                                   | Settled promises settle no earlier than creation.                              |
| P6  | ∀ p ∈ Promises : Settled(p) → p.settledAt ≤ p.timeoutAt                                                                   | Settled promises settle no later than their timeout.                           |
| P7  | ∀ p ∈ Promises : HasTarget(p) → HasTask(p)                                                                                 | Promises with a target tag have an associated task.                            |
| P8  | ∀ p ∈ Promises : ¬HasTarget(p) → ¬HasTask(p)                                                                              | Promises without a target tag have no associated task.                         |
| P9  | ∀ p ∈ Promises : Pending(p) ∧ HasTarget(p) ↔ HasPromiseTimeout(p)                                                         | A pending targeted promise has a promise timeout entry, and vice versa.        |
| P10 | ∀ p ∈ Promises : HasDelay(p) → HasTarget(p)                                                                               | Delayed promises must have a target.                                           |
| P11 | ∀ p ∈ Promises : HasDelay(p) → p.tags["resonate:delay"] ≥ 0                                                               | The delay value is non-negative.                                               |
| P12 | ∀ p ∈ Promises : HasDelay(p) → p.tags["resonate:delay"] < p.timeoutAt                                                     | The delay is strictly less than the promise timeout.                           |
| P13 | ∀ p ∈ Promises : Settled(p) → callbacks(p) = ∅                                                                             | Settled promises have no pending callbacks.                                    |
| P14 | ∀ p ∈ Promises : Settled(p) → listeners(p) = ∅                                                                             | Settled promises have no registered listeners.                                 |
| P15 | ∀ p ∈ Promises : Settled(p) → ¬HasPromiseTimeout(p)                                                                       | Settled promises have no promise timeout entry.                                |
| P16 | ∀ p ∈ Promises : Settled(p) ∧ HasTarget(p) → Fulfilled(task(p))                                                           | A settled promise with a target has a fulfilled task.                          |
| P17 | ∀ p ∈ Promises : Pending(p) ∧ HasTarget(p) → ¬Fulfilled(task(p))                                                          | A pending promise with a target has a non-fulfilled task.                      |
| P18 | ∀ p ∈ Promises : Timedout(p) → p.settledAt = p.timeoutAt                                                                  | A timed-out promise settles exactly at its timeout time.                       |
| P19 | ∀ p ∈ Promises : p.settledAt = p.timeoutAt ∧ HasTimer(p) → Resolved(p)                                                    | A timer promise settling at its timeout resolves successfully.                 |
| P20 | ∀ p ∈ Promises : p.settledAt = p.timeoutAt ∧ ¬HasTimer(p) → Timedout(p)                                                   | A non-timer promise settling at its timeout is rejected as timed out.          |
| P21 | ∀ p ∈ Promises : Timedout(p) → ¬HasTimer(p)                                                                               | Timed-out promises do not carry the timer tag.                                 |
| P22 | ∀ p ∈ Promises : p.id ∉ callbacks(p)                                                                                      | A promise is not its own callback awaiter.                                     |
| P23 | ∀ p ∈ Promises : ∀ c ∈ callbacks(p) : HasTarget(promise(c))                                                               | All callback awaiters are targeted promises.                                   |
| P24 | ∀ p ∈ Promises : ∀ c ∈ callbacks(p) : Pending(promise(c))                                                                 | All callback awaiters are pending.                                             |
| P25 | ∀ p ∈ Promises : ∀ c ∈ callbacks(p) : origin(c) = origin(p)                                                               | Callback awaiters share the same origin as their promise.                      |
| P26 | ∀ p ∈ Promises : "resonate:origin" ∈ p.tags → prefix(p.tags["resonate:origin"], p.id)                                     | The resonate:origin tag is a segment-prefix of the promise id.                 |
| P27 | ∀ p ∈ Promises : "resonate:origin" ∈ p.tags → "." ∉ p.tags["resonate:origin"]                                             | The resonate:origin tag contains no dot.                                       |
| P28 | ∀ p ∈ Promises : "resonate:branch" ∈ p.tags → prefix(p.tags["resonate:branch"], p.id)                                     | The resonate:branch tag is a segment-prefix of the promise id.                 |
| P29 | ∀ p ∈ Promises : "resonate:branch" ∈ p.tags → origin(p.tags["resonate:branch"]) = origin(p)                               | The resonate:branch origin matches the promise origin.                         |
| P30 | ∀ p ∈ Promises : "resonate:parent" ∈ p.tags → prefix(p.tags["resonate:parent"], p.id)                                     | The resonate:parent tag is a segment-prefix of the promise id.                 |
| P31 | ∀ p ∈ Promises : "resonate:parent" ∈ p.tags → origin(p.tags["resonate:parent"]) = origin(p)                               | The resonate:parent origin matches the promise origin.                         |
| P32 | ∀ p ∈ Promises : "resonate:prefix" ∈ p.tags → "." ∉ p.tags["resonate:prefix"]                                             | The resonate:prefix tag contains no dot.                                       |
| P33 | ∀ p ∈ Promises : HasSchedule(p) → "resonate:origin" ∈ p.tags ∧ p.tags["resonate:origin"] = p.id                          | Schedule promises have resonate:origin equal to their id.                      |
| P34 | ∀ p ∈ Promises : HasSchedule(p) → "resonate:prefix" ∈ p.tags ∧ p.tags["resonate:prefix"] = p.id                          | Schedule promises have resonate:prefix equal to their id.                      |
| P35 | ∀ p ∈ Promises : HasSchedule(p) → "resonate:branch" ∈ p.tags ∧ p.tags["resonate:branch"] = p.id                          | Schedule promises have resonate:branch equal to their id.                      |
| P36 | ∀ p ∈ Promises : HasSchedule(p) → "resonate:parent" ∈ p.tags ∧ p.tags["resonate:parent"] = p.id                          | Schedule promises have resonate:parent equal to their id.                      |
| P37 | ∀ p ∈ Promises : "resonate:branch" ∈ p.tags → ∃ q ∈ Promises : q.id = p.tags["resonate:branch"] ∧ HasTarget(q)           | The resonate:branch tag references an existing targeted promise.               |
| P38 | ∀ p ∈ Promises : "resonate:parent" ∈ p.tags → ∃ q ∈ Promises : q.id = p.tags["resonate:parent"]                          | The resonate:parent tag references an existing promise.                        |
| P39 | ∀ p ∈ Promises : "resonate:origin" ∈ p.tags → ∃ q ∈ Promises : q.id = p.tags["resonate:origin"]                          | The resonate:origin tag references an existing promise.                        |
| P40 | ∀ p ∈ Promises : "resonate:prefix" ∈ p.tags → ∃ q ∈ Promises : q.id = p.tags["resonate:prefix"]                          | The resonate:prefix tag references an existing promise.                        |

### Temporal

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| PT1 | ∀ p ∈ Promises' : p ∈ Promises                                                                                             | Promises are never removed.                                                    |
| PT2 | ∀ p ∈ Promises ∩ Promises' : p.createdAt = prev(p).createdAt                                                              | A promise's creation time is immutable.                                        |
| PT3 | ∀ p ∈ Promises ∩ Promises' : p.param = prev(p).param                                                                      | A promise's param is immutable.                                                |
| PT4 | ∀ p ∈ Promises ∩ Promises' : p.tags = prev(p).tags                                                                        | A promise's tags are immutable.                                                |
| PT5 | ∀ p ∈ Promises ∩ Promises' : p.timeoutAt = prev(p).timeoutAt                                                              | A promise's timeout is immutable.                                              |
| PT6 | ∀ p ∈ Promises ∩ Promises' : Settled(prev(p)) → p = prev(p)                                                               | Settled promises are fully immutable.                                          |
| PT7 | ∀ p ∈ Promises ∩ Promises' : Pending(prev(p)) ∧ Timedout(p) → p.settledAt = p.timeoutAt                                   | A promise timed out this transition settles exactly at its timeout time.       |

## Promise Timeout Invariants

| #    | Invariant                                                                                                                  | Description                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| PTO1 | ∀ pt, pt' ∈ PromiseTimeouts : pt.id = pt'.id → pt = pt'                                                                   | Promise timeout entries have unique ids.                                       |
| PTO2 | ∀ pt ∈ PromiseTimeouts : ∃ p ∈ Promises : p.id = pt.id ∧ Pending(p) ∧ HasTarget(p)                                        | Every promise timeout entry references a pending targeted promise.             |
| PTO3 | ∀ pt ∈ PromiseTimeouts : ∃ p ∈ Promises : p.id = pt.id ∧ pt.timeout = p.timeoutAt                                         | The timeout entry value matches the promise's timeout time.                    |

## Task Invariants

### State

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| T1  | ∀ t, u ∈ Tasks : t.id = u.id → t = u                                                                                      | Task ids are unique.                                                           |
| T2  | ∀ t ∈ Tasks : t.version ≥ 0                                                                                                | Task version is non-negative.                                                  |
| T3  | ∀ t ∈ Tasks : ∃ p ∈ Promises : p.id = t.id ∧ HasTarget(p)                                                                 | Every task corresponds to a targeted promise.                                  |
| T5  | ∀ t ∈ Tasks : Pending(t) ↔ HasExecuteMessage(t)                                                                            | Pending tasks have exactly one execute message, and vice versa.                |
| T6  | ∀ t ∈ Tasks : Pending(t) ↔ HasRetryTimeout(t)                                                                              | Pending tasks have exactly one retry timeout, and vice versa.                  |
| T7  | ∀ t ∈ Tasks : Pending(t) → ¬HasLeaseTimeout(t)                                                                             | Pending tasks have no lease timeout.                                           |
| T8  | ∀ t ∈ Tasks : Acquired(t) ↔ HasLeaseTimeout(t)                                                                             | Acquired tasks have exactly one lease timeout, and vice versa.                 |
| T9  | ∀ t ∈ Tasks : Acquired(t) → ¬HasRetryTimeout(t)                                                                            | Acquired tasks have no retry timeout.                                          |
| T10 | ∀ t ∈ Tasks : t.ttl ≠ ⊥ ↔ Acquired(t)                                                                                     | A task has a TTL iff it is acquired.                                           |
| T11 | ∀ t ∈ Tasks : t.ttl ≠ ⊥ → t.ttl > 0                                                                                       | A task's TTL is strictly positive when set.                                    |
| T12 | ∀ t ∈ Tasks : t.pid ≠ ⊥ ↔ Acquired(t)                                                                                     | A task has a pid iff it is acquired.                                           |
| T13 | ∀ t ∈ Tasks : Fulfilled(t) → Settled(promise(t))                                                                           | Fulfilled tasks have a settled promise.                                        |
| T14 | ∀ t ∈ Tasks : ¬Fulfilled(t) → Pending(promise(t))                                                                          | Non-fulfilled tasks have a pending promise.                                    |
| T15 | ∀ t ∈ Tasks : Suspended(t) → ∃ p ∈ Promises : t.id ∈ callbacks(p) ∧ Pending(p)                                            | Suspended tasks are awaiting at least one pending promise.                     |
| T16 | ∀ t ∈ Tasks : Suspended(t) → ∀ p ∈ Promises : t.id ∈ callbacks(p) → Pending(p)                                            | All promises a suspended task awaits are pending.                              |
| T17 | ∀ t ∈ Tasks : Suspended(t) → ∀ p ∈ Promises : t.id ∈ callbacks(p) → origin(p) = origin(t)                                 | All promises a suspended task awaits share the task's origin.                  |
| T18 | ∀ t ∈ Tasks : Suspended(t) → t.resumes = ∅                                                                                 | Suspended tasks have no resumes.                                               |
| T19 | ∀ t ∈ Tasks : Fulfilled(t) → t.resumes = ∅                                                                                 | Fulfilled tasks have no resumes.                                               |
| T20 | ∀ t ∈ Tasks : ∀ r ∈ t.resumes : origin(r) = origin(t)                                                                      | All resume ids share the same origin as the task.                              |

### Temporal

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TT1 | ∀ t ∈ Tasks' : t ∈ Tasks                                                                                                   | Tasks are never removed.                                                       |
| TT2 | ∀ t ∈ Tasks \ Tasks' : t.version ∈ {0, 1}                                                                                 | Newly added tasks start with version 0 or 1.                                   |
| TT3 | ∀ t ∈ Tasks ∩ Tasks' : t.version ≥ prev(t).version                                                                        | Task version is monotonically non-decreasing.                                  |
| TT4 | ∀ t ∈ Tasks ∩ Tasks' : Fulfilled(prev(t)) → t = prev(t)                                                                   | Fulfilled tasks are fully immutable.                                           |
| TT5 | ∀ t ∈ Tasks ∩ Tasks' : Acquired(t) ∧ ¬Acquired(prev(t)) → t.version = prev(t).version + 1                                 | Transitioning into acquired increments the version by exactly one.             |
| TT6 | ∀ t ∈ Tasks ∩ Tasks' : Acquired(t) ∧ ¬Acquired(prev(t)) → t.resumes = ∅                                                   | Transitioning into acquired clears the resumes.                                |

## Task Timeout Invariants

| #    | Invariant                                                                                                                  | Description                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TTO1 | ∀ tt, tt' ∈ TaskTimeouts : tt.id = tt'.id → tt = tt'                                                                      | Task timeout entries have unique ids.                                          |
| TTO2 | ∀ tt ∈ TaskTimeouts : tt.type = 0 → ∃ t ∈ Tasks : t.id = tt.id ∧ Pending(t)                                              | Every retry timeout entry corresponds to a pending task.                       |
| TTO3 | ∀ tt ∈ TaskTimeouts : tt.type = 1 → ∃ t ∈ Tasks : t.id = tt.id ∧ Acquired(t)                                             | Every lease timeout entry corresponds to an acquired task.                     |

## Schedule Invariants

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| S1  | ∀ s, s' ∈ Schedules : s.id = s'.id → s = s'                                                                               | Schedule ids are unique.                                                       |
| S2  | ∀ s ∈ Schedules : "." ∉ s.id                                                                                               | Schedule ids contain no dot.                                                   |
| S3  | ∀ s ∈ Schedules : "resonate:target" ∈ s.promiseTags                                                                       | Every schedule includes a target tag in its promise tags.                      |
| S4  | ∀ s ∈ Schedules : s.promiseTimeout ≥ 0                                                                                     | Schedule promise timeout is non-negative.                                      |
| S5  | ∀ s ∈ Schedules : s.lastRunAt ≠ ⊥ → s.lastRunAt < s.nextRunAt                                                             | The last run time precedes the next scheduled run time.                        |
| S6  | ∀ s ∈ Schedules : s.lastRunAt ≠ ⊥ → ∃ p ∈ Promises : p.tags["resonate:schedule"] = s.id ∧ p.createdAt = s.lastRunAt      | The last run corresponds to an existing promise created at that time.          |

## Schedule Timeout Invariants

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ST1 | ∀ s ∈ Schedules : ∃ st ∈ ScheduleTimeouts : st.id = s.id                                                                  | Every schedule has a corresponding timeout entry.                              |
| ST2 | ∀ st ∈ ScheduleTimeouts : ∃ s ∈ Schedules : s.id = st.id ∧ st.timeout = s.nextRunAt                                       | Every schedule timeout matches the schedule's next run time.                   |
| ST3 | ∀ st ∈ ScheduleTimeouts' \ ScheduleTimeouts : ∃ p ∈ Promises \ Promises' : p.tags["resonate:schedule"] = st.id ∧ p.createdAt = st.timeout | A new schedule timeout corresponds to a newly created schedule promise.        |
| ST4 | ∀ st ∈ ScheduleTimeouts' \ ScheduleTimeouts : ∃ p ∈ Promises \ Promises' : p.tags["resonate:schedule"] = st.id ∧ p.timeoutAt = st.timeout + schedule(st.id).promiseTimeout | A new schedule timeout's promise expires at the scheduled time plus the promise timeout. |
| ST5 | ∀ p ∈ Promises \ Promises' : HasSchedule(p) ∧ Settled(p) → p.settledAt = p.timeoutAt                                      | Newly created schedule promises that settle do so at their timeout time.       |

## Message Invariants

| #   | Invariant                                                                                                                  | Description                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| M1  | ∀ m, m' ∈ ExecuteMessages : m.task.id = m'.task.id → m = m'                                                               | Execute messages are unique per task.                                          |
| M2  | ∀ m, m' ∈ UnblockMessages : m.promise.id = m'.promise.id ∧ m.address = m'.address → m = m'                                | Unblock messages are unique per promise and address.                           |
| M3  | ∀ m ∈ ExecuteMessages : m.task.version = task(m.task.id).version                                                          | The version in an execute message matches the task's current version.          |
| M4  | ∀ m ∈ ExecuteMessages : Pending(promise(m.task.id))                                                                        | Execute messages correspond to pending promises.                               |
| M5  | ∀ m ∈ UnblockMessages : Settled(promise(m.promise.id))                                                                     | Unblock messages correspond to settled promises.                               |
