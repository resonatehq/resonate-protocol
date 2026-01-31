# Task State Transitions

## States

| Symbol | Description |
|--------|-------------|
| ⊥ | Task does not exist |
| ⟨p, e, l, v, c, R⟩ | Pending |
| ⟨a, e, l, v, c, R⟩ | Acquired |
| ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | Suspended |
| ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | Fulfilled |

## Symbols

| Symbol | Description |
|--------|-------------|
| t | Current time |
| e | Expiry time |
| l | TTL (time to live) |
| v | Version |
| c | Current (Invoke or Resume) |
| i | Invoke message |
| r | Resume message |
| R | Set of Resumes |
| P | Set of Promises |

## Operations

```
TaskGet()
TaskCreate(t, l)
TaskAcquire(t, l, v)
TaskRelease(t, l, v)
TaskSuspend(v, P)
TaskFence(v)
TaskHeartbeat(t, v)
TaskFulfill(v)
EnqueueInvoke(t, l, i)
EnqueueResume(t, l, r)
EnqueueSettle()
Tick(t)
```

## Side Effects

| Side Effect | Description |
|-------------|-------------|
| Send(i) | Send invoke message |
| Send(r) | Send resume message |

## Transitions

| Operation | Current State | Next State | Result | Side Effect(s) |
|-----------|---------------|------------|--------|----------------|
| TaskGet() | ⊥ | ⊥ | 404 | |
| TaskGet() | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 200 | |
| TaskGet() | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 200 | |
| TaskGet() | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 200 | |
| TaskGet() | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 200 | |
| TaskCreate(t, l) | ⊥ | ⟨a, t+l, l, 0, i, ∅⟩ | 200 | |
| TaskCreate(t, l) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskCreate(t, l) | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 409 | |
| TaskCreate(t, l) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskCreate(t, l) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 409 | |
| TaskAcquire(t, l, v) | ⊥ | ⊥ | 404 | |
| TaskAcquire(t, l, v) | ⟨p, e, l, v, c, R⟩ | ⟨a, t+l, l, v, c, R⟩ | 200 | |
| TaskAcquire(t, l, v') | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskAcquire(t, l, v) | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 409 | |
| TaskAcquire(t, l, v') | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 409 | |
| TaskAcquire(t, l, v) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskAcquire(t, l, v') | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskAcquire(t, l, v) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 409 | |
| TaskRelease(t, l, v) | ⊥ | ⊥ | 404 | |
| TaskRelease(t, l, v) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskRelease(t, l, v') | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskRelease(t, l, v) | ⟨a, e, l, v, i, R⟩ | ⟨p, t+l, l, v+1, i, R⟩ | 200 | Send(i) |
| TaskRelease(t, l, v) | ⟨a, e, l, v, r, R⟩ | ⟨p, t+l, l, v+1, r, R⟩ | 200 | Send(r) |
| TaskRelease(t, l, v') | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 409 | |
| TaskRelease(t, l, v) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskRelease(t, l, v') | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskRelease(t, l, v) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 409 | |
| TaskSuspend(v, P) | ⊥ | ⊥ | 404 | |
| TaskSuspend(v, P) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskSuspend(v', P) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskSuspend(v, P) | ⟨a, e, l, v, c, ∅⟩ : Pending(p) ∀p∈P | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 200 | |
| TaskSuspend(v, P) | ⟨a, e, l, v, c, ∅⟩ : Settled(p) ∃p∈P | ⟨a, e, l, v, r, ∅⟩ | 300 | |
| TaskSuspend(v, P) | ⟨a, e, l, v, c, c'::R'⟩ | ⟨a, e, l, v, c', R'⟩ | 300 | |
| TaskSuspend(v', P) | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 409 | |
| TaskSuspend(v, P) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskSuspend(v', P) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskSuspend(v, P) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 409 | |
| TaskFence(v) | ⊥ | ⊥ | 404 | |
| TaskFence(v) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 412 | |
| TaskFence(v') | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 412 | |
| TaskFence(v) | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 200 | |
| TaskFence(v') | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 412 | |
| TaskFence(v) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 412 | |
| TaskFence(v') | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 412 | |
| TaskFence(v) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 412 | |
| TaskHeartbeat(t, v) | ⊥ | ⊥ | 404 | |
| TaskHeartbeat(t, v) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 200 | |
| TaskHeartbeat(t, v') | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 200 | |
| TaskHeartbeat(t, v) | ⟨a, e, l, v, c, R⟩ | ⟨a, t+l, l, v, c, R⟩ | 200 | |
| TaskHeartbeat(t, v') | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 200 | |
| TaskHeartbeat(t, v) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 200 | |
| TaskHeartbeat(t, v') | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 200 | |
| TaskHeartbeat(t, v) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 200 | |
| TaskFulfill(v) | ⊥ | ⊥ | 404 | |
| TaskFulfill(v) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskFulfill(v') | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | 409 | |
| TaskFulfill(v) | ⟨a, e, l, v, c, R⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 200 | |
| TaskFulfill(v') | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | 409 | |
| TaskFulfill(v) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskFulfill(v') | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | 409 | |
| TaskFulfill(v) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | 409 | |
| EnqueueInvoke(t, l, i) | ⊥ | ⟨p, t+l, l, 0, i, ∅⟩ | | Send(i) |
| EnqueueInvoke(t, l, i) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R⟩ | | |
| EnqueueInvoke(t, l, i) | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R⟩ | | |
| EnqueueInvoke(t, l, i) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | | |
| EnqueueInvoke(t, l, i) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
| ~~EnqueueResume(t, l, r)~~ | ~~⊥~~ | ~~⊥~~ | | |
| EnqueueResume(t, l, r) | ⟨p, e, l, v, c, R⟩ | ⟨p, e, l, v, c, R::r⟩ | | |
| EnqueueResume(t, l, r) | ⟨a, e, l, v, c, R⟩ | ⟨a, e, l, v, c, R::r⟩ | | |
| EnqueueResume(t, l, r) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨p, t+l, l, v+1, r, ∅⟩ | | Send(r) |
| EnqueueResume(t, l, r) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
| ~~EnqueueSettle()~~ | ~~⊥~~ | ~~⊥~~ | | |
| EnqueueSettle() | ⟨p, e, l, v, c, R⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
| EnqueueSettle() | ⟨a, e, l, v, c, R⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
| EnqueueSettle() | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
| EnqueueSettle() | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
| Tick(t) | ⊥ | ⊥ | | |
| Tick(t) | ⟨p, e, l, v, c, R⟩ : t < e | ⟨p, e, l, v, c, R⟩ | | |
| Tick(t) | ⟨p, e, l, v, i, R⟩ : t ≥ e | ⟨p, t+l, l, v, i, R⟩ | | Send(i) |
| Tick(t) | ⟨p, e, l, v, r, R⟩ : t ≥ e | ⟨p, t+l, l, v, r, R⟩ | | Send(r) |
| Tick(t) | ⟨a, e, l, v, c, R⟩ : t < e | ⟨a, e, l, v, c, R⟩ | | |
| Tick(t) | ⟨a, e, l, v, i, R⟩ : t ≥ e | ⟨p, t+l, l, v+1, i, R⟩ | | Send(i) |
| Tick(t) | ⟨a, e, l, v, r, R⟩ : t ≥ e | ⟨p, t+l, l, v+1, r, R⟩ | | Send(r) |
| Tick(t) | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | | |
| Tick(t) | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | | |
