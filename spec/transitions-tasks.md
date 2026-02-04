# Task State Transitions

## States

| Symbol             | Description         |
| ------------------ | ------------------- |
| ⊥                  | Task does not exist |
| ⟨p, e, l, v, c, R⟩ | Pending             |
| ⟨a, e, l, v, c, R⟩ | Acquired            |
| ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | Suspended           |
| ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | Fulfilled           |

## Symbols

| Symbol | Description                |
| ------ | -------------------------- |
| t      | Current time               |
| e      | Expiry time                |
| l      | TTL (time to live)         |
| v      | Version                    |
| c      | Current (Invoke or Resume) |
| i      | Invoke message             |
| r      | Resume message             |
| R      | Set of Resumes             |
| P      | Set of Promises            |

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

| Side Effect | Description         |
| ----------- | ------------------- |
| Send(i)     | Send invoke message |
| Send(r)     | Send resume message |

## Transitions

| #   | Operation                  | Current State                        | Next State             | Result  | Side Effect(s) |
| --- | -------------------------- | ------------------------------------ | ---------------------- | ------- | -------------- |
| 1   | TaskGet()                  | ⊥                                    | ⊥                      | 404     |
| 2   | TaskGet()                  | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 200     |
| 3   | TaskGet()                  | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 200     |
| 4   | TaskGet()                  | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200     |
| 5   | TaskGet()                  | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200     |
| 6   | TaskCreate(t, l)           | ⊥                                    | ⟨a, t+l, l, 0, i, ∅⟩   | 200     |
| 7   | TaskCreate(t, l)           | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 8   | TaskCreate(t, l)           | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 409     |
| 9   | TaskCreate(t, l)           | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 10  | TaskCreate(t, l)           | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409     |
| 11  | TaskAcquire(t, l, v)       | ⊥                                    | ⊥                      | 404     |
| 12  | TaskAcquire(t, l, v)       | ⟨p, e, l, v, c, R⟩                   | ⟨a, t+l, l, v, c, R⟩   | 200     |
| 13  | TaskAcquire(t, l, v')      | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 14  | TaskAcquire(t, l, v)       | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 409     |
| 15  | TaskAcquire(t, l, v')      | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 409     |
| 16  | TaskAcquire(t, l, v)       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 17  | TaskAcquire(t, l, v')      | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 18  | TaskAcquire(t, l, v)       | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409     |
| 19  | TaskRelease(t, l, v)       | ⊥                                    | ⊥                      | 404     |
| 20  | TaskRelease(t, l, v)       | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 21  | TaskRelease(t, l, v')      | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 22  | TaskRelease(t, l, v)       | ⟨a, e, l, v, i, R⟩                   | ⟨p, t+l, l, v+1, i, R⟩ | 200     | Send(i)        |
| 23  | TaskRelease(t, l, v)       | ⟨a, e, l, v, r, R⟩                   | ⟨p, t+l, l, v+1, r, R⟩ | 200     | Send(r)        |
| 24  | TaskRelease(t, l, v')      | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 409     |
| 25  | TaskRelease(t, l, v)       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 26  | TaskRelease(t, l, v')      | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 27  | TaskRelease(t, l, v)       | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409     |
| 28  | TaskSuspend(v, P)          | ⊥                                    | ⊥                      | 404     |
| 29  | TaskSuspend(v, P)          | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 30  | TaskSuspend(v', P)         | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 31  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Pending(p) ∀p∈P | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200     |
| 32  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Settled(p) ∃p∈P | ⟨a, e, l, v, r, ∅⟩     | 300     |
| 33  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, c'::R'⟩              | ⟨a, e, l, v, c', R'⟩   | 300     |
| 34  | TaskSuspend(v', P)         | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 409     |
| 35  | TaskSuspend(v, P)          | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 36  | TaskSuspend(v', P)         | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 37  | TaskSuspend(v, P)          | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409     |
| 38  | TaskFence(v)               | ⊥                                    | ⊥                      | 404     |
| 39  | TaskFence(v)               | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 412     |
| 40  | TaskFence(v')              | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 412     |
| 41  | TaskFence(v)               | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 200     |
| 42  | TaskFence(v')              | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 412     |
| 43  | TaskFence(v)               | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 412     |
| 44  | TaskFence(v')              | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 412     |
| 45  | TaskFence(v)               | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 412     |
| 46  | TaskHeartbeat(t, v)        | ⊥                                    | ⊥                      | 404     |
| 47  | TaskHeartbeat(t, v)        | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 200     |
| 48  | TaskHeartbeat(t, v')       | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 200     |
| 49  | TaskHeartbeat(t, v)        | ⟨a, e, l, v, c, R⟩                   | ⟨a, t+l, l, v, c, R⟩   | 200     |
| 50  | TaskHeartbeat(t, v')       | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 200     |
| 51  | TaskHeartbeat(t, v)        | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200     |
| 52  | TaskHeartbeat(t, v')       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200     |
| 53  | TaskHeartbeat(t, v)        | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200     |
| 54  | TaskFulfill(v)             | ⊥                                    | ⊥                      | 404     |
| 55  | TaskFulfill(v)             | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 56  | TaskFulfill(v')            | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     | 409     |
| 57  | TaskFulfill(v)             | ⟨a, e, l, v, c, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200     |
| 58  | TaskFulfill(v')            | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     | 409     |
| 59  | TaskFulfill(v)             | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 60  | TaskFulfill(v')            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409     |
| 61  | TaskFulfill(v)             | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409     |
| 62  | EnqueueInvoke(t, l, i)     | ⊥                                    | ⟨p, t+l, l, 0, i, ∅⟩   | Send(i) |
| 63  | EnqueueInvoke(t, l, i)     | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R⟩     |
| 64  | EnqueueInvoke(t, l, i)     | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R⟩     |
| 65  | EnqueueInvoke(t, l, i)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |
| 66  | EnqueueInvoke(t, l, i)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
| 67  | ~~EnqueueResume(t, l, r)~~ | ~~⊥~~                                | ~~⊥~~                  |
| 68  | EnqueueResume(t, l, r)     | ⟨p, e, l, v, c, R⟩                   | ⟨p, e, l, v, c, R::r⟩  |
| 69  | EnqueueResume(t, l, r)     | ⟨a, e, l, v, c, R⟩                   | ⟨a, e, l, v, c, R::r⟩  |
| 70  | EnqueueResume(t, l, r)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨p, t+l, l, v+1, r, ∅⟩ | Send(r) |
| 71  | EnqueueResume(t, l, r)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
| 72  | ~~EnqueueSettle()~~        | ~~⊥~~                                | ~~⊥~~                  |
| 73  | EnqueueSettle()            | ⟨p, e, l, v, c, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
| 74  | EnqueueSettle()            | ⟨a, e, l, v, c, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
| 75  | EnqueueSettle()            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
| 76  | EnqueueSettle()            | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
| 77  | Tick(t)                    | ⊥                                    | ⊥                      |
| 78  | Tick(t)                    | ⟨p, e, l, v, c, R⟩ : t < e           | ⟨p, e, l, v, c, R⟩     |
| 79  | Tick(t)                    | ⟨p, e, l, v, i, R⟩ : t ≥ e           | ⟨p, t+l, l, v, i, R⟩   | Send(i) |
| 80  | Tick(t)                    | ⟨p, e, l, v, r, R⟩ : t ≥ e           | ⟨p, t+l, l, v, r, R⟩   | Send(r) |
| 81  | Tick(t)                    | ⟨a, e, l, v, c, R⟩ : t < e           | ⟨a, e, l, v, c, R⟩     |
| 82  | Tick(t)                    | ⟨a, e, l, v, i, R⟩ : t ≥ e           | ⟨p, t+l, l, v+1, i, R⟩ | Send(i) |
| 83  | Tick(t)                    | ⟨a, e, l, v, r, R⟩ : t ≥ e           | ⟨p, t+l, l, v+1, r, R⟩ | Send(r) |
| 84  | Tick(t)                    | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |
| 85  | Tick(t)                    | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |
