# Task State Transitions

## States

| Symbol          | Description         |
| --------------- | ------------------- |
| ⊥               | Task does not exist |
| ⟨p, e, ⊥, v, R⟩ | Pending             |
| ⟨a, e, l, v, R⟩ | Acquired            |
| ⟨s, ⊥, ⊥, v, ∅⟩ | Suspended           |
| ⟨h, ⊥, ⊥, v, R⟩ | Halted              |
| ⟨f, ⊥, ⊥, ⊥, ∅⟩ | Fulfilled           |

## Symbols

| Symbol | Description     |
| ------ | --------------- |
| t      | Current time    |
| e      | Expiry time     |
| l      | TTL (lease)     |
| L      | TTL (retry)     |
| v      | Version         |
| r      | Resume          |
| R      | Set of Resumes  |
| a      | Action          |
| p      | Promise         |
| P      | Set of Promises |

## Operations

```
TaskGet()
TaskCreate(t, l, p)
TaskAcquire(t, l, v)
TaskRelease(t, v)
TaskSuspend(v, P)
TaskHalt()
TaskContinue(t)
TaskFulfill(v)
TaskFence(v, a)
TaskHeartbeat(t, v)
EnqueueInvoke(t, r)
EnqueueResume(t, r)
EnqueueSettle()
Tick(t)
```

## Side Effects

| Side Effect   | Description      |
| ------------- | ---------------- |
| Send(Execute) | Send message     |
| PromiseCreate | Create a promise |
| PromiseSettle | Settle a promise |

## Predicates

| Predicate     | Description                    |
| ------------- | ------------------------------ |
| Exists(p)     | Promise p exists               |
| Pending(p)    | Promise p is pending           |
| Settled(p)    | Promise p is settled           |
| HasAddress(p) | Promise p has a target address |

## Transitions

| #   | Operation               | Current State                     | Next State              | Result | Side Effect(s)                |
| --- | ----------------------- | --------------------------------- | ----------------------- | ------ | ----------------------------- |
| 1   | TaskGet()               | ⊥                                 | ⊥                   | 404    |                |
| 2   | TaskGet()               | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 200    |                |
| 3   | TaskGet()               | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 200    |                |
| 4   | TaskGet()               | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 200    |                |
| 5   | TaskGet()               | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 200    |                |
| 6   | TaskGet()               | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 7   | TaskCreate(t, l, p)     | ⊥ : HasAddress(p) ^ Pending(p)    | ⟨a, t+l, l, 1, ∅⟩   | 200    | PromiseCreate  |
| 8   | TaskCreate(t, l, p)     | ⊥ : HasAddress(p) ^ Settled(p)    | ⟨f, ⊥, ⊥, ⊥, ∅⟩    | 200    | PromiseCreate  |
| 9   | TaskCreate(t, l, p)     | ⊥ : ¬HasAddress(p)                | ⊥                   | 422    |                |
| 10  | TaskCreate(t, l, p)     | ⟨p, e, ⊥, v, R⟩                   | ⟨a, t+l, l, v+1, ∅⟩  | 200    |                |
| 11  | TaskCreate(t, l, p)     | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 12  | TaskCreate(t, l, p)     | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 13  | TaskCreate(t, l, p)     | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 14  | TaskCreate(t, l, p)     | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 15  | TaskAcquire(t, l, v)    | ⊥                                 | ⊥                   | 404    |                |
| 16  | TaskAcquire(t, l, v)    | ⟨p, e, ⊥, v, R⟩                   | ⟨a, t+l, l, v+1, ∅⟩  | 200    |                |
| 17  | TaskAcquire(t, l, v')   | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 18  | TaskAcquire(t, l, v)    | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 19  | TaskAcquire(t, l, v')   | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 20  | TaskAcquire(t, l, v)    | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 21  | TaskAcquire(t, l, v')   | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 22  | TaskAcquire(t, l, v)    | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 23  | TaskAcquire(t, l, v')   | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 24  | TaskAcquire(t, l, v)    | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 25  | TaskRelease(t, v)       | ⊥                                 | ⊥                   | 404    |                |
| 26  | TaskRelease(t, v)       | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 27  | TaskRelease(t, v')      | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 28  | TaskRelease(t, v)       | ⟨a, e, l, v, R⟩                   | ⟨p, t+L, ⊥, v, R⟩   | 200    | Send(Execute)  |
| 29  | TaskRelease(t, v')      | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 30  | TaskRelease(t, v)       | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 31  | TaskRelease(t, v')      | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 32  | TaskRelease(t, v)       | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 33  | TaskRelease(t, v')      | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 34  | TaskRelease(t, v)       | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 35  | TaskSuspend(v, P)       | ⊥                                 | ⊥                   | 404    |                |
| 36  | TaskSuspend(v, P)       | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 37  | TaskSuspend(v', P)      | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 38  | TaskSuspend(v, P)       | ⟨a, e, l, v, R⟩ : ¬Exists(p) ∃p∈P | ⟨a, e, l, v, R⟩     | 422    |                |
| 39  | TaskSuspend(v, P)       | ⟨a, e, l, v, R⟩ : Settled(p) ∃p∈P | ⟨a, e, l, v, ∅⟩     | 300    |                |
| 40  | TaskSuspend(v, P)       | ⟨a, e, l, v, R⟩ : Pending(p) ∀p∈P | ⟨s, ⊥, ⊥, v, ∅⟩     | 200    | Add task.id to awaiter set ∀p∈P |
| 41  | TaskSuspend(v', P)      | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 42  | TaskSuspend(v, P)       | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 43  | TaskSuspend(v', P)      | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 44  | TaskSuspend(v, P)       | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 45  | TaskSuspend(v', P)      | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 46  | TaskSuspend(v, P)       | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 47  | TaskHalt()              | ⊥                                 | ⊥                   | 404    |                |
| 48  | TaskHalt()              | ⟨p, e, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 200    |                |
| 49  | TaskHalt()              | ⟨a, e, l, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 200    |                |
| 50  | TaskHalt()              | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨h, ⊥, ⊥, v, ∅⟩     | 200    |                |
| 51  | TaskHalt()              | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 200    |                |
| 52  | TaskHalt()              | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 53  | TaskContinue(t)         | ⊥                                 | ⊥                   | 404    |                |
| 54  | TaskContinue(t)         | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 55  | TaskContinue(t)         | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 56  | TaskContinue(t)         | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 57  | TaskContinue(t)         | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨p, t+L, ⊥, v, R⟩   | 200    | Send(Execute)  |
| 58  | TaskContinue(t)         | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 59  | TaskFulfill(v)          | ⊥                                 | ⊥                   | 404    |                |
| 60  | TaskFulfill(v)          | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 61  | TaskFulfill(v')         | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 62  | TaskFulfill(v)          | ⟨a, e, l, v, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 63  | TaskFulfill(v')         | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 64  | TaskFulfill(v)          | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 65  | TaskFulfill(v')         | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 66  | TaskFulfill(v)          | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 67  | TaskFulfill(v')         | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 68  | TaskFulfill(v)          | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 69  | TaskFence(v, a)         | ⊥                                 | ⊥                   | 404    |                |
| 70  | TaskFence(v, a)         | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 71  | TaskFence(v', a)        | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 409    |                |
| 72  | TaskFence(v, a)         | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 200    | PromiseCreate ∨ PromiseSettle |
| 73  | TaskFence(v', a)        | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 409    |                |
| 74  | TaskFence(v, a)         | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 75  | TaskFence(v', a)        | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 409    |                |
| 76  | TaskFence(v, a)         | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 77  | TaskFence(v', a)        | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 409    |                |
| 78  | TaskFence(v, a)         | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 79  | TaskHeartbeat(t, v)     | ⊥                                 | ⊥                   | 200    |                |
| 80  | TaskHeartbeat(t, v)     | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 200    |                |
| 81  | TaskHeartbeat(t, v')    | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     | 200    |                |
| 82  | TaskHeartbeat(t, v)     | ⟨a, e, l, v, R⟩                   | ⟨a, t+l, l, v, R⟩   | 200    |                |
| 83  | TaskHeartbeat(t, v')    | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     | 200    |                |
| 84  | TaskHeartbeat(t, v)     | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 200    |                |
| 85  | TaskHeartbeat(t, v')    | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     | 200    |                |
| 86  | TaskHeartbeat(t, v)     | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 200    |                |
| 87  | TaskHeartbeat(t, v')    | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     | 200    |                |
| 88  | TaskHeartbeat(t, v)     | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 89  | EnqueueInvoke(t, r)     | ⊥                                 | ⟨p, t+L, ⊥, 0, {r}⟩  |        | Send(Execute)  |
| 90  | EnqueueInvoke(t, r)     | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R⟩     |        |                |
| 91  | EnqueueInvoke(t, r)     | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R⟩     |        |                |
| 92  | EnqueueInvoke(t, r)     | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     |        |                |
| 93  | EnqueueInvoke(t, r)     | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     |        |                |
| 94  | EnqueueInvoke(t, r)     | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 95  | ~~EnqueueResume(t, r)~~ | ~~⊥~~                             | ~~⊥~~               |        |                |
| 96  | EnqueueResume(t, r)     | ⟨p, e, ⊥, v, R⟩                   | ⟨p, e, ⊥, v, R::r⟩  |        |                |
| 97  | EnqueueResume(t, r)     | ⟨a, e, l, v, R⟩                   | ⟨a, e, l, v, R::r⟩  |        |                |
| 98  | EnqueueResume(t, r)     | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨p, t+L, ⊥, v, {r}⟩  |        | Send(Execute)  |
| 99  | EnqueueResume(t, r)     | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R::r⟩  |        |                |
| 100 | EnqueueResume(t, r)     | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 101 | EnqueueSettle()         | ⊥                                 | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 102 | EnqueueSettle()         | ⟨p, e, ⊥, v, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 103 | EnqueueSettle()         | ⟨a, e, l, v, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 104 | EnqueueSettle()         | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 105 | EnqueueSettle()         | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 106 | EnqueueSettle()         | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 107 | Tick(t)                 | ⊥                                 | ⊥                   |        |                |
| 108 | Tick(t)                 | ⟨p, e, ⊥, v, R⟩ : t < e           | ⟨p, e, ⊥, v, R⟩     |        |                |
| 109 | Tick(t)                 | ⟨p, e, ⊥, v, R⟩ : t ≥ e           | ⟨p, t+L, ⊥, v, R⟩   |        | Send(Execute)  |
| 110 | Tick(t)                 | ⟨a, e, l, v, R⟩ : t < e           | ⟨a, e, l, v, R⟩     |        |                |
| 111 | Tick(t)                 | ⟨a, e, l, v, R⟩ : t ≥ e           | ⟨p, t+L, ⊥, v, R⟩   |        | Send(Execute)  |
| 112 | Tick(t)                 | ⟨s, ⊥, ⊥, v, ∅⟩                   | ⟨s, ⊥, ⊥, v, ∅⟩     |        |                |
| 113 | Tick(t)                 | ⟨h, ⊥, ⊥, v, R⟩                   | ⟨h, ⊥, ⊥, v, R⟩     |        |                |
| 114 | Tick(t)                 | ⟨f, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ∅⟩     |        |                |

## Fence Transitions

When a task is acquired and the version matches (transition #72 above), the task.fence operation executes an inner promise action. The task state remains `⟨a, e, l, v, R⟩` throughout — the transitions below describe the promise state changes and side effects that occur within a successful fence.

| #  | Operation                                  | Promise Current State              | Promise Next State   | Result | Side Effect(s)                                        |
| -- | ------------------------------------------ | ---------------------------------- | -------------------- | ------ | ----------------------------------------------------- |
| 1   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⊥ : t < o                          | ⟨p, o, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 2   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⊥ : t ≥ o                          | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 3   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊥, ⊥, P, A⟩  | 200    |                                                       |
| 4   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 5   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊥, a, P, A⟩ : t < o        | ⟨p, o, ⊥, a, P, A⟩  | 200    |                                                       |
| 6   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 7   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊤, ⊥, P, A⟩  | 200    |                                                       |
| 8   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 9   | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊤, a, P, A⟩ : t < o        | ⟨p, o, ⊤, a, P, A⟩  | 200    |                                                       |
| 10  | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 11  | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 12  | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 13  | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 14  | TaskFence(v, PromiseCreate(t, o, ⊥, ⊥))    | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 15  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⊥ : t < o                          | ⟨p, o, ⊤, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 16  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⊥ : t ≥ o                          | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 17  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊥, ⊥, P, A⟩  | 200    |                                                       |
| 18  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 19  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊥, a, P, A⟩ : t < o        | ⟨p, o, ⊥, a, P, A⟩  | 200    |                                                       |
| 20  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 21  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊤, ⊥, P, A⟩  | 200    |                                                       |
| 22  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 23  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊤, a, P, A⟩ : t < o        | ⟨p, o, ⊤, a, P, A⟩  | 200    |                                                       |
| 24  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 25  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 26  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 27  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 28  | TaskFence(v, PromiseCreate(t, o, ⊤, ⊥))    | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 29  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⊥ : t < o                          | ⟨p, o, ⊥, a, ∅, ∅⟩  | 200    | EnqueueInvoke                                         |
| 30  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⊥ : t ≥ o                          | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle                                         |
| 31  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊥, ⊥, P, A⟩  | 200    |                                                       |
| 32  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 33  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊥, a, P, A⟩ : t < o        | ⟨p, o, ⊥, a, P, A⟩  | 200    |                                                       |
| 34  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 35  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊤, ⊥, P, A⟩  | 200    |                                                       |
| 36  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 37  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊤, a, P, A⟩ : t < o        | ⟨p, o, ⊤, a, P, A⟩  | 200    |                                                       |
| 38  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 39  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 40  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 41  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 42  | TaskFence(v, PromiseCreate(t, o, ⊥, a))    | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 43  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⊥ : t < o                          | ⟨p, o, ⊤, a, ∅, ∅⟩  | 200    | EnqueueInvoke                                         |
| 44  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⊥ : t ≥ o                          | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle                                         |
| 45  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊥, ⊥, P, A⟩  | 200    |                                                       |
| 46  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 47  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊥, a, P, A⟩ : t < o        | ⟨p, o, ⊥, a, P, A⟩  | 200    |                                                       |
| 48  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 49  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o        | ⟨p, o, ⊤, ⊥, P, A⟩  | 200    |                                                       |
| 50  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 51  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊤, a, P, A⟩ : t < o        | ⟨p, o, ⊤, a, P, A⟩  | 200    |                                                       |
| 52  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 53  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 54  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 55  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 56  | TaskFence(v, PromiseCreate(t, o, ⊤, a))    | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 57  | TaskFence(v, PromiseSettle(r))             | ⊥                                  | ⊥                    | 404    |                                                       |
| 58  | TaskFence(v, PromiseSettle(r))             | ⟨p, o, ⊥, ⊥, P, A⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 59  | TaskFence(v, PromiseSettle(r))             | ⟨p, o, ⊥, a, P, A⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 60  | TaskFence(v, PromiseSettle(r))             | ⟨p, o, ⊤, ⊥, P, A⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 61  | TaskFence(v, PromiseSettle(r))             | ⟨p, o, ⊤, a, P, A⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 62  | TaskFence(v, PromiseSettle(r))             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 63  | TaskFence(v, PromiseSettle(r))             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 64  | TaskFence(v, PromiseSettle(r))             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 65  | TaskFence(v, PromiseSettle(r))             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 66  | TaskFence(v, PromiseSettle(x))             | ⊥                                  | ⊥                    | 404    |                                                       |
| 67  | TaskFence(v, PromiseSettle(x))             | ⟨p, o, ⊥, ⊥, P, A⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 68  | TaskFence(v, PromiseSettle(x))             | ⟨p, o, ⊥, a, P, A⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 69  | TaskFence(v, PromiseSettle(x))             | ⟨p, o, ⊤, ⊥, P, A⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 70  | TaskFence(v, PromiseSettle(x))             | ⟨p, o, ⊤, a, P, A⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 71  | TaskFence(v, PromiseSettle(x))             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 72  | TaskFence(v, PromiseSettle(x))             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 73  | TaskFence(v, PromiseSettle(x))             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 74  | TaskFence(v, PromiseSettle(x))             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 75  | TaskFence(v, PromiseSettle(c))             | ⊥                                  | ⊥                    | 404    |                                                       |
| 76  | TaskFence(v, PromiseSettle(c))             | ⟨p, o, ⊥, ⊥, P, A⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 77  | TaskFence(v, PromiseSettle(c))             | ⟨p, o, ⊥, a, P, A⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 78  | TaskFence(v, PromiseSettle(c))             | ⟨p, o, ⊤, ⊥, P, A⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 79  | TaskFence(v, PromiseSettle(c))             | ⟨p, o, ⊤, a, P, A⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 80  | TaskFence(v, PromiseSettle(c))             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 81  | TaskFence(v, PromiseSettle(c))             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 82  | TaskFence(v, PromiseSettle(c))             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
| 83  | TaskFence(v, PromiseSettle(c))             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩  | 200    |                                                       |
