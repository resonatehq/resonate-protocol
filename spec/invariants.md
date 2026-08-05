# Invariants

**State invariants** hold at every state in isolation. **Temporal invariants** hold between any two consecutive states, where S denotes the current state and S' denotes the immediately preceding state.

## Symbols

| Symbol             | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| S                  | Current state                                                        |
| S'                 | Previous state                                                       |
| promise(t)         | The promise with id = t.id                                           |
| task(p)            | The task with id = p.id                                              |
| callbacks(p)       | The set of callback ids on promise p                                 |
| listeners(p)       | The set of listeners registered on promise p                         |
| origin(p)          | The origin of promise p's id                                         |
| prefix(a, b)       | a is a segment-prefix of b: b = a ∨ b starts with a ++ "."          |
| cron(expr, t)      | The next time strictly after t according to cron expression expr     |
| plain(t)           | t with all `{{...}}` substitution blocks removed                     |
| expand(t, id, ts)  | t with `{{.id}}` replaced by id and `{{.timestamp}}` replaced by ts  |

## State

A **state** is defined as the tuple of all collections:

S = (Promises, Tasks, Schedules, PromiseTimeouts, TaskTimeouts, ScheduleTimeouts, Messages)

| Set              | Description                             |
| ---------------- | --------------------------------------- |
| Promises         | The set of all promises                 |
| Tasks            | The set of all tasks                    |
| Schedules        | The set of all schedules                |
| PromiseTimeouts  | The set of all promise timeout entries  |
| TaskTimeouts     | The set of all task timeout entries     |
| ScheduleTimeouts | The set of all schedule timeout entries |
| Messages         | The set of all messages                 |

The primed variants (Promises', Tasks', etc.) denote the corresponding components of the previous state S'.

## Predicates

### Promise

| Predicate            | Definition                                                           |
| -------------------- | -------------------------------------------------------------------- |
| Pending(p)           | p.state = "pending"                                                  |
| Resolved(p)          | p.state = "resolved"                                                 |
| Rejected(p)          | p.state = "rejected"                                                 |
| Timedout(p)          | p.state = "rejected_timedout"                                        |
| Settled(p)           | p.state ∈ {resolved, rejected, rejected_canceled, rejected_timedout} |
| HasTarget(p)         | "resonate:target" ∈ p.tags                                           |
| HasTimer(p)          | "resonate:timer" ∈ p.tags                                            |
| HasDelay(p)          | "resonate:delay" ∈ p.tags                                            |
| HasSchedule(p)       | "resonate:schedule" ∈ p.tags                                         |
| HasTask(p)           | ∃ t ∈ Tasks : t.id = p.id                                            |
| HasPromiseTimeout(p) | ∃ pt ∈ PromiseTimeouts : pt.id = p.id                                |

### Task

| Predicate            | Definition                                             |
| -------------------- | ------------------------------------------------------ |
| Pending(t)           | t.state = "pending"                                    |
| Acquired(t)          | t.state = "acquired"                                   |
| Suspended(t)         | t.state = "suspended"                                  |
| Halted(t)            | t.state = "halted"                                     |
| Fulfilled(t)         | t.state = "fulfilled"                                  |
| HasTimeout(t)        | ∃ tt ∈ TaskTimeouts : tt.id = t.id                     |
| HasLeaseTimeout(t)   | ∃ tt ∈ TaskTimeouts : tt.id = t.id ∧ tt.type = 1       |
| HasRetryTimeout(t)   | ∃ tt ∈ TaskTimeouts : tt.id = t.id ∧ tt.type = 0       |
| HasExecuteMessage(t) | ∃ m ∈ Messages : m.kind = "execute" ∧ m.task.id = t.id |

## Promise Invariants

### State

| #    | Invariant                                                                                                       | Description                                                                                 |
| ---- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| P01  | ∀ p, q ∈ Promises : p.id = q.id → p = q                                                                         | Promise ids are unique.                                                                     |
| P02  | ∀ p ∈ Promises : p.timeoutAt ≥ 0                                                                                | Promise timeout is non-negative.                                                            |
| P03  | ∀ p ∈ Promises : p.createdAt ≥ 0                                                                                | Promise creation time is non-negative.                                                      |
| P04  | ∀ p ∈ Promises : p.createdAt ≤ p.timeoutAt                                                                      | Promise is created at or before its timeout.                                                |
| P05  | ∀ p ∈ Promises : Pending(p) → p.settledAt = ⊥                                                                   | Pending promises have no settled timestamp.                                                 |
| P06  | ∀ p ∈ Promises : p.settledAt ≠ ⊥ ↔ Settled(p)                                                                   | A promise has a settled timestamp if and only if it is settled.                             |
| P07  | ∀ p ∈ Promises : Settled(p) → p.createdAt ≤ p.settledAt                                                         | Settled promises settle no earlier than creation.                                           |
| P08  | ∀ p ∈ Promises : Settled(p) → p.settledAt ≤ p.timeoutAt                                                         | Settled promises settle no later than their timeout.                                        |
| P09  | ∀ p ∈ Promises : HasTarget(p) → HasTask(p)                                                                      | Promises with a resonate:target tag have an associated task.                                |
| P10  | ∀ p ∈ Promises : ¬HasTarget(p) → ¬HasTask(p)                                                                    | Promises without a resonate:target tag have no associated task.                             |
| P11  | ∀ p ∈ Promises : Pending(p) ∧ HasTarget(p) ↔ HasPromiseTimeout(p)                                               | A pending promise with a resonate:target tag has a promise timeout entry, and vice versa.   |
| P12  | ∀ p ∈ Promises : Settled(p) → ¬HasPromiseTimeout(p)                                                             | Settled promises have no promise timeout entry.                                             |
| P13  | ∀ p ∈ Promises : Settled(p) → callbacks(p) = ∅                                                                  | Settled promises have no callbacks.                                                         |
| P14  | ∀ p ∈ Promises : Settled(p) → listeners(p) = ∅                                                                  | Settled promises have no listeners.                                                         |
| P15  | ∀ p ∈ Promises : Settled(p) ∧ HasTarget(p) → Fulfilled(task(p))                                                 | A settled promise with a resonate:target tag has a fulfilled task.                          |
| P16  | ∀ p ∈ Promises : Pending(p) ∧ HasTarget(p) → ¬Fulfilled(task(p))                                                | A pending promise with a resonate:target tag has a non-fulfilled task.                      |
| P17  | ∀ p ∈ Promises : Timedout(p) → p.settledAt = p.timeoutAt                                                        | A timed-out promise settles exactly at its timeout time.                                    |
| P18  | ∀ p ∈ Promises : p.settledAt = p.timeoutAt ∧ HasTimer(p) → Resolved(p)                                          | A promise with a resonate:timer tag settling at its timeout resolves successfully.          |
| P19  | ∀ p ∈ Promises : p.settledAt = p.timeoutAt ∧ ¬HasTimer(p) → Timedout(p)                                         | A promise without a resonate:timer tag settling at its timeout is rejected as timed out.    |
| P20  | ∀ p ∈ Promises : Resolved(p) ∧ p.settledAt = p.timeoutAt → HasTimer(p)                                          | A resolved promise that settled exactly at its timeout has a resonate:timer tag.            |
| P21  | ∀ p ∈ Promises : Timedout(p) → ¬HasTimer(p)                                                                     | Timed-out promises do not have a resonate:timer tag.                                        |
| P22  | ∀ p ∈ Promises : HasDelay(p) → HasTarget(p)                                                                     | Promises with a resonate:delay tag must have a resonate:target tag.                         |
| P23  | ∀ p ∈ Promises : HasDelay(p) → p.tags["resonate:delay"] ≥ 0                                                     | The resonate:delay tag value is non-negative.                                               |
| P24  | ∀ p ∈ Promises : HasDelay(p) → p.tags["resonate:delay"] < p.timeoutAt                                           | The resonate:delay tag value is strictly less than the promise timeout.                     |
| P25  | ∀ p ∈ Promises : p.id ∉ callbacks(p)                                                                            | A promise is not registered as a callback on itself.                                        |
| P26  | ∀ p ∈ Promises : ∀ c ∈ callbacks(p) : HasTarget(promise(c))                                                     | All callbacks are promises with a resonate:target tag.                                      |
| P27  | ∀ p ∈ Promises : ∀ c ∈ callbacks(p) : Pending(promise(c))                                                       | All callbacks are pending.                                                                  |
| P28  | ∀ p ∈ Promises : ∀ c ∈ callbacks(p) : origin(c) = origin(p)                                                     | Callbacks share the same origin as the promise.                                             |
| P29  | ∀ p ∈ Promises : "resonate:origin" ∈ p.tags → prefix(p.tags["resonate:origin"], p.id)                           | The resonate:origin tag is a segment-prefix of the promise id.                              |
| P30  | ∀ p ∈ Promises : "resonate:origin" ∈ p.tags → "." ∉ p.tags["resonate:origin"]                                   | The resonate:origin tag contains no dot.                                                    |
| P31  | ∀ p ∈ Promises : "resonate:branch" ∈ p.tags → prefix(p.tags["resonate:branch"], p.id)                           | The resonate:branch tag is a segment-prefix of the promise id.                              |
| P32  | ∀ p ∈ Promises : "resonate:branch" ∈ p.tags → origin(p.tags["resonate:branch"]) = origin(p)                     | The resonate:branch origin matches the promise origin.                                      |
| P33  | ∀ p ∈ Promises : "resonate:parent" ∈ p.tags → prefix(p.tags["resonate:parent"], p.id)                           | The resonate:parent tag is a segment-prefix of the promise id.                              |
| P34  | ∀ p ∈ Promises : "resonate:parent" ∈ p.tags → origin(p.tags["resonate:parent"]) = origin(p)                     | The resonate:parent origin matches the promise origin.                                      |
| P35  | ∀ p ∈ Promises : "resonate:prefix" ∈ p.tags → "." ∉ p.tags["resonate:prefix"]                                   | The resonate:prefix tag contains no dot.                                                    |
| P36  | ∀ p ∈ Promises : HasSchedule(p) → HasTarget(p)                                                                   | Promises with a resonate:schedule tag have a resonate:target tag.                           |
| P37  | ∀ p ∈ Promises : HasSchedule(p) → "resonate:origin" ∈ p.tags ∧ p.tags["resonate:origin"] = p.id                 | Promises with a resonate:schedule tag have resonate:origin equal to their id.               |
| P38  | ∀ p ∈ Promises : HasSchedule(p) → "resonate:prefix" ∈ p.tags ∧ p.tags["resonate:prefix"] = p.id                 | Promises with a resonate:schedule tag have resonate:prefix equal to their id.               |
| P39  | ∀ p ∈ Promises : HasSchedule(p) → "resonate:branch" ∈ p.tags ∧ p.tags["resonate:branch"] = p.id                 | Promises with a resonate:schedule tag have resonate:branch equal to their id.               |
| P40  | ∀ p ∈ Promises : HasSchedule(p) → "resonate:parent" ∈ p.tags ∧ p.tags["resonate:parent"] = p.id                 | Promises with a resonate:schedule tag have resonate:parent equal to their id.               |

### Temporal

| #    | Invariant                                                                                | Description                                                              |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P41  | ∀ p ∈ Promises' : p ∈ Promises                                                           | Promises are never removed.                                              |
| P42  | ∀ p ∈ Promises ∩ Promises' : p.createdAt = prev(p).createdAt                             | A promise's creation time is immutable.                                  |
| P43  | ∀ p ∈ Promises ∩ Promises' : p.param = prev(p).param                                     | A promise's param is immutable.                                          |
| P44  | ∀ p ∈ Promises ∩ Promises' : p.tags = prev(p).tags                                       | A promise's tags are immutable.                                          |
| P45  | ∀ p ∈ Promises ∩ Promises' : p.timeoutAt = prev(p).timeoutAt                             | A promise's timeout is immutable.                                        |
| P46  | ∀ p ∈ Promises ∩ Promises' : Settled(prev(p)) → p = prev(p)                              | Settled promises are fully immutable.                                    |
| P47  | ∀ p ∈ Promises ∩ Promises' : Pending(prev(p)) ∧ Timedout(p) → p.settledAt = p.timeoutAt  | A promise timed out this transition settles exactly at its timeout time. |

### Timeout

| #    | Invariant                                                                           | Description                                                                          |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| P48  | ∀ pt, pt' ∈ PromiseTimeouts : pt.id = pt'.id → pt = pt'                             | Promise timeout entries have unique ids.                                             |
| P49  | ∀ pt ∈ PromiseTimeouts : ∃ p ∈ Promises : p.id = pt.id ∧ Pending(p) ∧ HasTarget(p)  | Every promise timeout entry references a pending promise with a resonate:target tag. |
| P50  | ∀ pt ∈ PromiseTimeouts : ∃ p ∈ Promises : p.id = pt.id ∧ pt.timeout = p.timeoutAt   | The timeout entry value matches the promise's timeout time.                          |
| P51  | ∀ pt ∈ PromiseTimeouts' \ PromiseTimeouts : Settled(promise(pt.id))                  | When a promise timeout is removed, the corresponding promise is settled.             |

## Task Invariants

### State

| #    | Invariant                                                                                  | Description                                                     |
| ---- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| T01  | ∀ t, u ∈ Tasks : t.id = u.id → t = u                                                       | Task ids are unique.                                            |
| T02  | ∀ t ∈ Tasks : t.version ≥ 0                                                                | Task version is non-negative.                                   |
| T03  | ∀ t ∈ Tasks : ∃ p ∈ Promises : p.id = t.id ∧ HasTarget(p)                                  | Every task corresponds to a promise with a resonate:target tag. |
| T04  | ∀ t ∈ Tasks : Fulfilled(t) → Settled(promise(t))                                           | Fulfilled tasks have a settled promise.                         |
| T05  | ∀ t ∈ Tasks : ¬Fulfilled(t) → Pending(promise(t))                                          | Non-fulfilled tasks have a pending promise.                     |
| T06  | ∀ t ∈ Tasks : Pending(t) ↔ HasExecuteMessage(t)                                            | Pending tasks have exactly one execute message, and vice versa. |
| T07  | ∀ t ∈ Tasks : Pending(t) ↔ HasRetryTimeout(t)                                              | Pending tasks have exactly one retry timeout, and vice versa.   |
| T08  | ∀ t ∈ Tasks : Pending(t) → ¬HasLeaseTimeout(t)                                             | Pending tasks have no lease timeout.                            |
| T09  | ∀ t ∈ Tasks : Acquired(t) ↔ HasLeaseTimeout(t)                                             | Acquired tasks have exactly one lease timeout, and vice versa.  |
| T10  | ∀ t ∈ Tasks : Acquired(t) → ¬HasRetryTimeout(t)                                            | Acquired tasks have no retry timeout.                           |
| T11  | ∀ t ∈ Tasks : t.ttl ≠ ⊥ ↔ Acquired(t)                                                      | A task has a TTL iff it is acquired.                            |
| T12  | ∀ t ∈ Tasks : t.ttl ≠ ⊥ → t.ttl > 0                                                        | A task's TTL is strictly positive when set.                     |
| T13  | ∀ t ∈ Tasks : t.pid ≠ ⊥ ↔ Acquired(t)                                                      | A task has a pid iff it is acquired.                            |
| T14  | ∀ t ∈ Tasks : Suspended(t) → ∃ p ∈ Promises : t.id ∈ callbacks(p) ∧ Pending(p)             | Suspended tasks are awaiting at least one pending promise.      |
| T15  | ∀ t ∈ Tasks : Suspended(t) → ∀ p ∈ Promises : t.id ∈ callbacks(p) → Pending(p)             | All promises a suspended task awaits are pending.               |
| T16  | ∀ t ∈ Tasks : Suspended(t) → ∀ p ∈ Promises : t.id ∈ callbacks(p) → origin(p) = origin(t)  | All promises a suspended task awaits share the task's origin.   |
| T17  | ∀ t ∈ Tasks : Suspended(t) → t.resumes = ∅                                                 | Suspended tasks have no resumes.                                |
| T18  | ∀ t ∈ Tasks : Fulfilled(t) → t.resumes = ∅                                                 | Fulfilled tasks have no resumes.                                |
| T19  | ∀ t ∈ Tasks : ∀ r ∈ t.resumes : origin(r) = origin(t)                                      | All resume ids share the same origin as the task.               |

### Temporal

| #    | Invariant                                                                                  | Description                                                        |
| ---- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| T20  | ∀ t ∈ Tasks' : t ∈ Tasks                                                                   | Tasks are never removed.                                           |
| T21  | ∀ t ∈ Tasks \ Tasks' : t.version ∈ {0, 1}                                                  | Newly added tasks start with version 0 or 1.                       |
| T22  | ∀ t ∈ Tasks ∩ Tasks' : t.version ≥ prev(t).version                                         | Task version is monotonically non-decreasing.                      |
| T23  | ∀ t ∈ Tasks ∩ Tasks' : Fulfilled(prev(t)) → t = prev(t)                                    | Fulfilled tasks are fully immutable.                               |
| T24  | ∀ t ∈ Tasks ∩ Tasks' : Acquired(t) ∧ ¬Acquired(prev(t)) → t.version = prev(t).version + 1  | Transitioning into acquired increments the version by exactly one. |
| T25  | ∀ t ∈ Tasks ∩ Tasks' : t.version ≠ prev(t).version → (Acquired(t) ∧ ¬Acquired(prev(t)))    | Task version changes only on transition into the acquired state.   |
| T26  | ∀ t ∈ Tasks ∩ Tasks' : Acquired(t) ∧ ¬Acquired(prev(t)) → t.resumes = ∅                    | Transitioning into acquired clears the resumes.                    |

### Timeout

| #    | Invariant                                                                     | Description                                                |
| ---- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| T27  | ∀ tt, tt' ∈ TaskTimeouts : tt.id = tt'.id → tt = tt'                          | Task timeout entries have unique ids.                      |
| T28  | ∀ tt ∈ TaskTimeouts : tt.type = 0 → ∃ t ∈ Tasks : t.id = tt.id ∧ Pending(t)   | Every retry timeout entry corresponds to a pending task.   |
| T29  | ∀ tt ∈ TaskTimeouts : tt.type = 1 → ∃ t ∈ Tasks : t.id = tt.id ∧ Acquired(t)  | Every lease timeout entry corresponds to an acquired task. |

## Schedule Invariants

### State

| #    | Invariant                                                                                                            | Description                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| S01  | ∀ s, s' ∈ Schedules : s.id = s'.id → s = s'                                                                          | Schedule ids are unique.                                                                     |
| S02  | ∀ s ∈ Schedules : "." ∉ s.id                                                                                         | Schedule ids contain no dot.                                                                 |
| S03  | ∀ s ∈ Schedules : "resonate:target" ∈ s.promiseTags                                                                  | Every schedule includes a resonate:target tag in its promise tags.                           |
| S04  | ∀ s ∈ Schedules : s.promiseTimeout ≥ 0                                                                               | Schedule promise timeout is non-negative.                                                    |
| S05  | ∀ s ∈ Schedules : s.lastRunAt ≠ ⊥ → s.lastRunAt < s.nextRunAt                                                        | The last run time precedes the next scheduled run time.                                      |
| S06  | ∀ s ∈ Schedules : s.lastRunAt ≠ ⊥ → ∃ p ∈ Promises : p.tags["resonate:schedule"] = s.id ∧ p.createdAt = s.lastRunAt  | The last run corresponds to an existing promise created at that time.                        |
| S07  | ∀ s ∈ Schedules : s.lastRunAt = ⊥ → s.nextRunAt = cron(s.cron, s.createdAt)                                          | If the schedule has never run, the next run time is the first cron tick after creation.      |
| S08  | ∀ s ∈ Schedules : s.lastRunAt ≠ ⊥ → s.nextRunAt = cron(s.cron, s.lastRunAt)                                          | If the schedule has run before, the next run time is the first cron tick after the last run. |
| S09  | ∀ s ∈ Schedules : "\0" ∉ s.promiseId                                                                                  | Schedule promise ID template contains no null bytes.                                         |
| S10  | ∀ s ∈ Schedules : "." ∉ plain(s.promiseId)                                                                            | Dots in the schedule promise ID template appear only within substitution blocks.             |

### Temporal

| #    | Invariant                                                                                                                                                                   | Description                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| S11  | ∀ s ∈ Schedules ∩ Schedules' : s.createdAt = prev(s).createdAt                                                                                                             | A schedule's creation time is immutable.                                                     |
| S12  | ∀ s ∈ Schedules ∩ Schedules' : s.cron = prev(s).cron                                                                                                                       | A schedule's cron expression is immutable.                                                   |
| S13  | ∀ s ∈ Schedules ∩ Schedules' : s.promiseTags = prev(s).promiseTags                                                                                                         | A schedule's promise tags are immutable.                                                     |
| S14  | ∀ s ∈ Schedules ∩ Schedules' : s.promiseTimeout = prev(s).promiseTimeout                                                                                                   | A schedule's promise timeout is immutable.                                                   |
| S15  | ∀ s ∈ Schedules ∩ Schedules' : s.promiseId = prev(s).promiseId                                                                                                             | A schedule's promise ID template is immutable.                                               |
| S16  | ∀ s ∈ Schedules ∩ Schedules' : s.promiseParam = prev(s).promiseParam                                                                                                       | A schedule's promise param is immutable.                                                     |
| S17  | ∀ s ∈ Schedules ∩ Schedules' : s.lastRunAt ≠ prev(s).lastRunAt → s.lastRunAt = prev(s).nextRunAt                                                                           | When a schedule's last run time changes, it is set to the previous next run time.            |
| S18  | ∀ s ∈ Schedules ∩ Schedules' : s.lastRunAt ≠ ⊥ ∧ prev(s).lastRunAt ≠ ⊥ → s.lastRunAt > prev(s).lastRunAt                                                                   | `lastRunAt` is strictly increasing.                                                          |
| S19  | ∀ s ∈ Schedules ∩ Schedules' : s.nextRunAt > prev(s).nextRunAt                                                                                                              | `nextRunAt` is strictly increasing.                                                          |
| S20  | ∀ st ∈ ScheduleTimeouts' \ ScheduleTimeouts : ∃ p ∈ Promises \ Promises' : p.tags["resonate:schedule"] = st.id ∧ p.createdAt = st.timeout                                   | A new schedule timeout corresponds to a newly created promise with a resonate:schedule tag.  |
| S21  | ∀ st ∈ ScheduleTimeouts' \ ScheduleTimeouts : ∃ p ∈ Promises \ Promises' : p.tags["resonate:schedule"] = st.id ∧ p.timeoutAt = st.timeout + schedule(st.id).promiseTimeout  | A new schedule timeout's promise expires at the scheduled time plus the promise timeout.     |
| S22  | ∀ st ∈ ScheduleTimeouts' \ ScheduleTimeouts : ∃ p ∈ Promises \ Promises' : p.tags["resonate:schedule"] = st.id ∧ p.id = expand(schedule(st.id).promiseId, st.id, st.timeout) | The id of a newly created schedule promise is the expanded promise ID template.              |
| S23  | ∀ p ∈ Promises \ Promises' : HasSchedule(p) ∧ Settled(p) → p.settledAt = p.timeoutAt                                                                                       | Newly created promises with a resonate:schedule tag that settle do so at their timeout time. |

### Timeout

| #    | Invariant                                                                                              | Description                                                  |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| S24  | ∀ st, st' ∈ ScheduleTimeouts : st.id = st'.id → st = st'                                               | Schedule timeout entries have unique ids.                    |
| S25  | ∀ st ∈ ScheduleTimeouts : ∃ s ∈ Schedules : s.id = st.id                                               | Every schedule timeout references a schedule.                |
| S26  | ∀ st ∈ ScheduleTimeouts : ∃ s ∈ Schedules : s.id = st.id ∧ st.timeout = s.nextRunAt                    | Every schedule timeout matches the schedule's next run time. |

## Message Invariants

| #    | Invariant                                                                                   | Description                                                           |
| ---- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| M01  | ∀ m, m' ∈ ExecuteMessages : m.task.id = m'.task.id → m = m'                                 | Execute messages are unique per task.                                 |
| M02  | ∀ m, m' ∈ UnblockMessages : m.promise.id = m'.promise.id ∧ m.address = m'.address → m = m'  | Unblock messages are unique per promise and address.                  |
| M03  | ∀ m ∈ ExecuteMessages : m.task.version = task(m.task.id).version                            | The version in an execute message matches the task's current version. |
| M04  | ∀ m ∈ ExecuteMessages : Pending(promise(m.task.id))                                         | Execute messages correspond to pending promises.                      |
| M05  | ∀ m ∈ UnblockMessages : Settled(promise(m.promise.id))                                      | Unblock messages correspond to settled promises.                      |
