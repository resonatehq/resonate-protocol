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
| a      | Action             |
| P      | Set of Promises    |

## Operations

```
TaskGet()
TaskCreate(t, l)
TaskAcquire(t, l, v)
TaskRelease(t, l, v)
TaskSuspend(v, P)
TaskFulfill(v)
TaskFence(v, a)
TaskHeartbeat(t, v)
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
| 7   | TaskCreate(t, l)           | ⟨p, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, M⟩   | 200    |                |
| 8   | TaskCreate(t, l)           | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 9   | TaskCreate(t, l)           | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 10  | TaskCreate(t, l)           | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
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
| 30  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : ¬Exists(p) ∃p∈P | ⟨a, e, l, v, c, ∅⟩     | 422    |                |
| 31  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Settled(p) ∃p∈P | ⟨a, e, l, v, m, ∅⟩     | 300    |                |
| 32  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Pending(p) ∀p∈P | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 33  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, c'::M'⟩              | ⟨a, e, l, v, c', M'⟩   | 300    |                |
| 34  | TaskSuspend(v', P)         | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 35  | TaskSuspend(v, P)          | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 36  | TaskSuspend(v', P)         | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 37  | TaskSuspend(v, P)          | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 38  | TaskFulfill(v)             | ⊥                                    | ⊥                      | 404    |                |
| 39  | TaskFulfill(v)             | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 40  | TaskFulfill(v')            | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 41  | TaskFulfill(v)             | ⟨a, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 42  | TaskFulfill(v')            | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 43  | TaskFulfill(v)             | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 44  | TaskFulfill(v')            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 45  | TaskFulfill(v)             | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 46  | TaskFence(v, a)            | ⊥                                    | ⊥                      | 404    |                |
| 47  | TaskFence(v, a)            | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 48  | TaskFence(v', a)           | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 49  | TaskFence(v, a)            | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 50  | TaskFence(v', a)           | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 51  | TaskFence(v, a)            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 52  | TaskFence(v', a)           | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 53  | TaskFence(v, a)            | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 54  | TaskHeartbeat(t, v)        | ⊥                                    | ⊥                      | 200    |                |
| 55  | TaskHeartbeat(t, v)        | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 56  | TaskHeartbeat(t, v')       | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 57  | TaskHeartbeat(t, v)        | ⟨a, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, M⟩   | 200    |                |
| 58  | TaskHeartbeat(t, v')       | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 59  | TaskHeartbeat(t, v)        | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 60  | TaskHeartbeat(t, v')       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 61  | TaskHeartbeat(t, v)        | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 62  | EnqueueInvoke(t, l, m)     | ⊥                                    | ⟨p, t+l, l, 0, m, ∅⟩   |        | Send(m)        |
| 63  | EnqueueInvoke(t, l, m)     | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     |        |                |
| 64  | EnqueueInvoke(t, l, m)     | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     |        |                |
| 65  | EnqueueInvoke(t, l, m)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |        |                |
| 66  | EnqueueInvoke(t, l, m)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 67  | ~~EnqueueResume(t, l, m)~~ | ~~⊥~~                                | ~~⊥~~                  |        |                |
| 68  | EnqueueResume(t, l, m)     | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M::m⟩  |        |                |
| 69  | EnqueueResume(t, l, m)     | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M::m⟩  |        |                |
| 70  | EnqueueResume(t, l, m)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨p, t+l, l, v+1, m, ∅⟩ |        | Send(m)        |
| 71  | EnqueueResume(t, l, m)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 72  | ~~EnqueueSettle()~~        | ~~⊥~~                                | ~~⊥~~                  |        |                |
| 73  | EnqueueSettle()            | ⟨p, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 74  | EnqueueSettle()            | ⟨a, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 75  | EnqueueSettle()            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 76  | EnqueueSettle()            | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 77  | Tick(t)                    | ⊥                                    | ⊥                      |        |                |
| 78  | Tick(t)                    | ⟨p, e, l, v, c, M⟩ : t < e           | ⟨p, e, l, v, c, M⟩     |        |                |
| 79  | Tick(t)                    | ⟨p, e, l, v, c, M⟩ : t ≥ e           | ⟨p, t+l, l, v, c, M⟩   |        | Send(c)        |
| 80  | Tick(t)                    | ⟨a, e, l, v, c, M⟩ : t < e           | ⟨a, e, l, v, c, M⟩     |        |                |
| 81  | Tick(t)                    | ⟨a, e, l, v, c, M⟩ : t ≥ e           | ⟨p, t+l, l, v+1, c, M⟩ |        | Send(c)        |
| 82  | Tick(t)                    | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |        |                |
| 83  | Tick(t)                    | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |

## Fence Transitions

When a task is acquired and the version matches (transition #49 above), the task.fence operation executes an inner promise action. The task state remains `⟨a, e, l, v, c, M⟩` throughout — the transitions below describe the promise state changes and side effects that occur within a successful fence.

| #   | Operation                              | Promise Current State | Promise Next State    | Result | Side Effect(s)                                       |
| --- | -------------------------------------- | --------------------- | --------------------- | ------ | ---------------------------------------------------- |
| 1   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⊥                     | ⟨p, o, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 2   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 3   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨p, o, ⊥, a, P, A⟩   | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 4   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 5   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨p, o, ⊤, a, P, A⟩   | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 6   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 7   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 8   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 9   | TaskFence(v, PromiseCreate(o, ⊥, ⊥))  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 10  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⊥                     | ⟨p, o, ⊤, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 11  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 12  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨p, o, ⊥, a, P, A⟩   | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 13  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 14  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨p, o, ⊤, a, P, A⟩   | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 15  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 16  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 17  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 18  | TaskFence(v, PromiseCreate(o, ⊤, ⊥))  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 19  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⊥                     | ⟨p, o, ⊥, a, ∅, ∅⟩   | 200    | EnqueueInvoke                                        |
| 20  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 21  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨p, o, ⊥, a, P, A⟩   | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 22  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 23  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨p, o, ⊤, a, P, A⟩   | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 24  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 25  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 26  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 27  | TaskFence(v, PromiseCreate(o, ⊥, a))  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 28  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⊥                     | ⟨p, o, ⊤, a, ∅, ∅⟩   | 200    | EnqueueInvoke                                        |
| 29  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 30  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨p, o, ⊥, a, P, A⟩   | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 31  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 32  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨p, o, ⊤, a, P, A⟩   | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 33  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 34  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 35  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 36  | TaskFence(v, PromiseCreate(o, ⊤, a))  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 37  | TaskFence(v, PromiseSettle(r))         | ⊥                     | ⊥                     | 404    |                                                      |
| 38  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 39  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊥, a, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 40  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 41  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊤, a, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 42  | TaskFence(v, PromiseSettle(r))         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 43  | TaskFence(v, PromiseSettle(r))         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 44  | TaskFence(v, PromiseSettle(r))         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 45  | TaskFence(v, PromiseSettle(r))         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 46  | TaskFence(v, PromiseSettle(x))         | ⊥                     | ⊥                     | 404    |                                                      |
| 47  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 48  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊥, a, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 49  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 50  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊤, a, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 51  | TaskFence(v, PromiseSettle(x))         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 52  | TaskFence(v, PromiseSettle(x))         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 53  | TaskFence(v, PromiseSettle(x))         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 54  | TaskFence(v, PromiseSettle(x))         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 55  | TaskFence(v, PromiseSettle(c))         | ⊥                     | ⊥                     | 404    |                                                      |
| 56  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 57  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊥, a, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 58  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 59  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊤, a, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 60  | TaskFence(v, PromiseSettle(c))         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 61  | TaskFence(v, PromiseSettle(c))         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 62  | TaskFence(v, PromiseSettle(c))         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 63  | TaskFence(v, PromiseSettle(c))         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
