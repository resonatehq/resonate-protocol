# Task State Transitions

## States

| Symbol              | Description         |
| ------------------- | ------------------- |
| ⊥                   | Task does not exist |
| ⟨p, e, l, v, c, M⟩ | Pending             |
| ⟨a, e, l, v, c, M⟩ | Acquired            |
| ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | Suspended           |
| ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩ | Fulfilled           |

## Symbols

| Symbol | Description        |
| ------ | ------------------ |
| t      | Current time       |
| e      | Expiry time        |
| l      | TTL (time to live) |
| v      | Version            |
| c      | Current message    |
| m      | Message            |
| M      | Set of Messages    |
| P      | Set of Promises    |

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
EnqueueInvoke(t, l, m)
EnqueueResume(t, l, m)
EnqueueSettle()
Tick(t)
```

## Side Effects

| Side Effect | Description  |
| ----------- | ------------ |
| Send(m)     | Send message |

## Transitions

| #   | Operation                  | Current State                        | Next State             | Result | Side Effect(s) |
| --- | -------------------------- | ------------------------------------ | ---------------------- | ------ | -------------- |
| 1   | TaskGet()                  | ⊥                                    | ⊥                      | 404    |                |
| 2   | TaskGet()                  | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 3   | TaskGet()                  | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 4   | TaskGet()                  | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 5   | TaskGet()                  | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 6   | TaskCreate(t, l)           | ⊥                                    | ⟨a, t+l, l, 0, m, ∅⟩   | 200    |                |
| 7   | TaskCreate(t, l)           | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 8   | TaskCreate(t, l)           | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 9   | TaskCreate(t, l)           | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 10  | TaskCreate(t, l)           | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 11  | TaskAcquire(t, l, v)       | ⊥                                    | ⊥                      | 404    |                |
| 12  | TaskAcquire(t, l, v)       | ⟨p, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, M⟩   | 200    |                |
| 13  | TaskAcquire(t, l, v')      | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 14  | TaskAcquire(t, l, v)       | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 15  | TaskAcquire(t, l, v')      | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 16  | TaskAcquire(t, l, v)       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 17  | TaskAcquire(t, l, v')      | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 18  | TaskAcquire(t, l, v)       | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 19  | TaskRelease(t, l, v)       | ⊥                                    | ⊥                      | 404    |                |
| 20  | TaskRelease(t, l, v)       | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 21  | TaskRelease(t, l, v')      | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 22  | TaskRelease(t, l, v)       | ⟨a, e, l, v, c, M⟩                   | ⟨p, t+l, l, v+1, c, M⟩ | 200    | Send(c)        |
| 23  | TaskRelease(t, l, v')      | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 24  | TaskRelease(t, l, v)       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 25  | TaskRelease(t, l, v')      | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 26  | TaskRelease(t, l, v)       | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 27  | TaskSuspend(v, P)          | ⊥                                    | ⊥                      | 404    |                |
| 28  | TaskSuspend(v, P)          | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 29  | TaskSuspend(v', P)         | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 30  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Pending(p) ∀p∈P | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 31  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Settled(p) ∃p∈P | ⟨a, e, l, v, m, ∅⟩     | 300    |                |
| 32  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, c'::M'⟩              | ⟨a, e, l, v, c', M'⟩   | 300    |                |
| 33  | TaskSuspend(v', P)         | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 34  | TaskSuspend(v, P)          | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 35  | TaskSuspend(v', P)         | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 36  | TaskSuspend(v, P)          | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 37  | TaskFence(v)               | ⊥                                    | ⊥                      | 404    |                |
| 38  | TaskFence(v)               | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 412    |                |
| 39  | TaskFence(v')              | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 412    |                |
| 40  | TaskFence(v)               | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 41  | TaskFence(v')              | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 412    |                |
| 42  | TaskFence(v)               | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 412    |                |
| 43  | TaskFence(v')              | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 412    |                |
| 44  | TaskFence(v)               | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 412    |                |
| 45  | TaskHeartbeat(t, v)        | ⊥                                    | ⊥                      | 404    |                |
| 46  | TaskHeartbeat(t, v)        | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 47  | TaskHeartbeat(t, v')       | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 48  | TaskHeartbeat(t, v)        | ⟨a, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, M⟩   | 200    |                |
| 49  | TaskHeartbeat(t, v')       | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 50  | TaskHeartbeat(t, v)        | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 51  | TaskHeartbeat(t, v')       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 52  | TaskHeartbeat(t, v)        | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 53  | TaskFulfill(v)             | ⊥                                    | ⊥                      | 404    |                |
| 54  | TaskFulfill(v)             | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 55  | TaskFulfill(v')            | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 56  | TaskFulfill(v)             | ⟨a, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 57  | TaskFulfill(v')            | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 58  | TaskFulfill(v)             | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 59  | TaskFulfill(v')            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 60  | TaskFulfill(v)             | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 61  | EnqueueInvoke(t, l, m)     | ⊥                                    | ⟨p, t+l, l, 0, m, ∅⟩   |        | Send(m)        |
| 62  | EnqueueInvoke(t, l, m)     | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     |        |                |
| 63  | EnqueueInvoke(t, l, m)     | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     |        |                |
| 64  | EnqueueInvoke(t, l, m)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |        |                |
| 65  | EnqueueInvoke(t, l, m)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 66  | ~~EnqueueResume(t, l, m)~~ | ~~⊥~~                                | ~~⊥~~                  |        |                |
| 67  | EnqueueResume(t, l, m)     | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M::m⟩  |        |                |
| 68  | EnqueueResume(t, l, m)     | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M::m⟩  |        |                |
| 69  | EnqueueResume(t, l, m)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨p, t+l, l, v+1, m, ∅⟩ |        | Send(m)        |
| 70  | EnqueueResume(t, l, m)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 71  | ~~EnqueueSettle()~~        | ~~⊥~~                                | ~~⊥~~                  |        |                |
| 72  | EnqueueSettle()            | ⟨p, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 73  | EnqueueSettle()            | ⟨a, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 74  | EnqueueSettle()            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 75  | EnqueueSettle()            | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 76  | Tick(t)                    | ⊥                                    | ⊥                      |        |                |
| 77  | Tick(t)                    | ⟨p, e, l, v, c, M⟩ : t < e           | ⟨p, e, l, v, c, M⟩     |        |                |
| 78  | Tick(t)                    | ⟨p, e, l, v, c, M⟩ : t ≥ e           | ⟨p, t+l, l, v, c, M⟩   |        | Send(c)        |
| 79  | Tick(t)                    | ⟨a, e, l, v, c, M⟩ : t < e           | ⟨a, e, l, v, c, M⟩     |        |                |
| 80  | Tick(t)                    | ⟨a, e, l, v, c, M⟩ : t ≥ e           | ⟨p, t+l, l, v+1, c, M⟩ |        | Send(c)        |
| 81  | Tick(t)                    | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |        |                |
| 82  | Tick(t)                    | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
