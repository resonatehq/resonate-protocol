# Task State Transitions

## States

| Symbol              | Description         |
| ------------------- | ------------------- |
| ⊥                   | Task does not exist |
| ⟨p, e, l, v, c, M⟩ | Pending             |
| ⟨a, e, l, v, c, M⟩ | Acquired            |
| ⟨s, ⊥, ⊥, v, ⊥, ∅⟩ | Suspended           |
| ⟨h, ⊥, ⊥, v, c, M⟩ | Halted              |
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
TaskHalt()
TaskContinue(t, l)
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
| 5   | TaskGet()                  | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 200    |                |
| 6   | TaskGet()                  | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 7   | TaskCreate(t, l)           | ⊥                                    | ⟨a, t+l, l, 0, m, ∅⟩   | 200    |                |
| 8   | TaskCreate(t, l)           | ⟨p, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, ∅⟩   | 200    |                |
| 9   | TaskCreate(t, l)           | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 10  | TaskCreate(t, l)           | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 11  | TaskCreate(t, l)           | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 12  | TaskCreate(t, l)           | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 13  | TaskAcquire(t, l, v)       | ⊥                                    | ⊥                      | 404    |                |
| 14  | TaskAcquire(t, l, v)       | ⟨p, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, ∅⟩   | 200    |                |
| 15  | TaskAcquire(t, l, v')      | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 16  | TaskAcquire(t, l, v)       | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 17  | TaskAcquire(t, l, v')      | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 18  | TaskAcquire(t, l, v)       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 19  | TaskAcquire(t, l, v')      | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 20  | TaskAcquire(t, l, v)       | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 21  | TaskAcquire(t, l, v')      | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 22  | TaskAcquire(t, l, v)       | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 23  | TaskRelease(t, l, v)       | ⊥                                    | ⊥                      | 404    |                |
| 24  | TaskRelease(t, l, v)       | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 25  | TaskRelease(t, l, v')      | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 26  | TaskRelease(t, l, v)       | ⟨a, e, l, v, c, M⟩                   | ⟨p, t+l, l, v+1, c, M⟩ | 200    | Send(c)        |
| 27  | TaskRelease(t, l, v')      | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 28  | TaskRelease(t, l, v)       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 29  | TaskRelease(t, l, v')      | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 30  | TaskRelease(t, l, v)       | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 31  | TaskRelease(t, l, v')      | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 32  | TaskRelease(t, l, v)       | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 33  | TaskSuspend(v, P)          | ⊥                                    | ⊥                      | 404    |                |
| 34  | TaskSuspend(v, P)          | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 35  | TaskSuspend(v', P)         | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 36  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : ¬Exists(p) ∃p∈P | ⟨a, e, l, v, c, ∅⟩     | 422    |                |
| 37  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Settled(p) ∃p∈P | ⟨a, e, l, v, m, ∅⟩     | 300    |                |
| 38  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, ∅⟩ : Pending(p) ∀p∈P | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 39  | TaskSuspend(v, P)          | ⟨a, e, l, v, c, c'::M'⟩              | ⟨a, e, l, v, c', ∅⟩    | 300    |                |
| 40  | TaskSuspend(v', P)         | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 41  | TaskSuspend(v, P)          | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 42  | TaskSuspend(v', P)         | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 43  | TaskSuspend(v, P)          | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 44  | TaskSuspend(v', P)         | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 45  | TaskSuspend(v, P)          | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 46  | TaskHalt()                 | ⊥                                    | ⊥                      | 404    |                |
| 47  | TaskHalt()                 | ⟨p, e, l, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 200    |                |
| 48  | TaskHalt()                 | ⟨a, e, l, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 200    |                |
| 49  | TaskHalt()                 | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨h, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 50  | TaskHalt()                 | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 200    |                |
| 51  | TaskHalt()                 | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 52  | TaskContinue(t, l)         | ⊥                                    | ⊥                      | 404    |                |
| 53  | TaskContinue(t, l)         | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 54  | TaskContinue(t, l)         | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 55  | TaskContinue(t, l)         | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 56  | TaskContinue(t, l)         | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨p, t+l, l, v+1, c, M⟩ | 200    | Send(c)        |
| 57  | TaskContinue(t, l)         | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 58  | TaskFulfill(v)             | ⊥                                    | ⊥                      | 404    |                |
| 59  | TaskFulfill(v)             | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 60  | TaskFulfill(v')            | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 61  | TaskFulfill(v)             | ⟨a, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 62  | TaskFulfill(v')            | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 63  | TaskFulfill(v)             | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 64  | TaskFulfill(v')            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 65  | TaskFulfill(v)             | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 66  | TaskFulfill(v')            | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 67  | TaskFulfill(v)             | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 68  | TaskFence(v, a)            | ⊥                                    | ⊥                      | 404    |                |
| 69  | TaskFence(v, a)            | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 70  | TaskFence(v', a)           | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 409    |                |
| 71  | TaskFence(v, a)            | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 72  | TaskFence(v', a)           | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 409    |                |
| 73  | TaskFence(v, a)            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 74  | TaskFence(v', a)           | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 409    |                |
| 75  | TaskFence(v, a)            | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 76  | TaskFence(v', a)           | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 409    |                |
| 77  | TaskFence(v, a)            | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 409    |                |
| 78  | TaskHeartbeat(t, v)        | ⊥                                    | ⊥                      | 200    |                |
| 79  | TaskHeartbeat(t, v)        | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 80  | TaskHeartbeat(t, v')       | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     | 200    |                |
| 81  | TaskHeartbeat(t, v)        | ⟨a, e, l, v, c, M⟩                   | ⟨a, t+l, l, v, c, M⟩   | 200    |                |
| 82  | TaskHeartbeat(t, v')       | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     | 200    |                |
| 83  | TaskHeartbeat(t, v)        | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 84  | TaskHeartbeat(t, v')       | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     | 200    |                |
| 85  | TaskHeartbeat(t, v)        | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 200    |                |
| 86  | TaskHeartbeat(t, v')       | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     | 200    |                |
| 87  | TaskHeartbeat(t, v)        | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     | 200    |                |
| 88  | EnqueueInvoke(t, l, m)     | ⊥                                    | ⟨p, t+l, l, 0, m, ∅⟩   |        | Send(m)        |
| 89  | EnqueueInvoke(t, l, m)     | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M⟩     |        |                |
| 90  | EnqueueInvoke(t, l, m)     | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M⟩     |        |                |
| 91  | EnqueueInvoke(t, l, m)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |        |                |
| 92  | EnqueueInvoke(t, l, m)     | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     |        |                |
| 93  | EnqueueInvoke(t, l, m)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 94  | ~~EnqueueResume(t, l, m)~~ | ~~⊥~~                                | ~~⊥~~                  |        |                |
| 95  | EnqueueResume(t, l, m)     | ⟨p, e, l, v, c, M⟩                   | ⟨p, e, l, v, c, M::m⟩  |        |                |
| 96  | EnqueueResume(t, l, m)     | ⟨a, e, l, v, c, M⟩                   | ⟨a, e, l, v, c, M::m⟩  |        |                |
| 97  | EnqueueResume(t, l, m)     | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨p, t+l, l, v+1, m, ∅⟩ |        | Send(m)        |
| 98  | EnqueueResume(t, l, m)     | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M::m⟩  |        |                |
| 99  | EnqueueResume(t, l, m)     | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 100 | ~~EnqueueSettle()~~        | ~~⊥~~                                | ~~⊥~~                  |        |                |
| 101 | EnqueueSettle()            | ⟨p, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 102 | EnqueueSettle()            | ⟨a, e, l, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 103 | EnqueueSettle()            | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 104 | EnqueueSettle()            | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 105 | EnqueueSettle()            | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |
| 106 | Tick(t)                    | ⊥                                    | ⊥                      |        |                |
| 107 | Tick(t)                    | ⟨p, e, l, v, c, M⟩ : t < e           | ⟨p, e, l, v, c, M⟩     |        |                |
| 108 | Tick(t)                    | ⟨p, e, l, v, c, M⟩ : t ≥ e           | ⟨p, t+l, l, v, c, M⟩   |        | Send(c)        |
| 109 | Tick(t)                    | ⟨a, e, l, v, c, M⟩ : t < e           | ⟨a, e, l, v, c, M⟩     |        |                |
| 110 | Tick(t)                    | ⟨a, e, l, v, c, M⟩ : t ≥ e           | ⟨p, t+l, l, v+1, c, M⟩ |        | Send(c)        |
| 111 | Tick(t)                    | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩                   | ⟨s, ⊥, ⊥, v, ⊥, ∅⟩     |        |                |
| 112 | Tick(t)                    | ⟨h, ⊥, ⊥, v, c, M⟩                   | ⟨h, ⊥, ⊥, v, c, M⟩     |        |                |
| 113 | Tick(t)                    | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩                   | ⟨f, ⊥, ⊥, ⊥, ⊥, ∅⟩     |        |                |

## Fence Transitions

When a task is acquired and the version matches (transition #71 above), the task.fence operation executes an inner promise action. The task state remains `⟨a, e, l, v, c, M⟩` throughout — the transitions below describe the promise state changes and side effects that occur within a successful fence.

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
| 38  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 39  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊥, a, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 40  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 41  | TaskFence(v, PromiseSettle(r))         | ⟨p, o, ⊤, a, P, A⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 42  | TaskFence(v, PromiseSettle(r))         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 43  | TaskFence(v, PromiseSettle(r))         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 44  | TaskFence(v, PromiseSettle(r))         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 45  | TaskFence(v, PromiseSettle(r))         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 46  | TaskFence(v, PromiseSettle(x))         | ⊥                     | ⊥                     | 404    |                                                      |
| 47  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 48  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊥, a, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 49  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 50  | TaskFence(v, PromiseSettle(x))         | ⟨p, o, ⊤, a, P, A⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 51  | TaskFence(v, PromiseSettle(x))         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 52  | TaskFence(v, PromiseSettle(x))         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 53  | TaskFence(v, PromiseSettle(x))         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 54  | TaskFence(v, PromiseSettle(x))         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 55  | TaskFence(v, PromiseSettle(c))         | ⊥                     | ⊥                     | 404    |                                                      |
| 56  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊥, ⊥, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 57  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊥, a, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 58  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊤, ⊥, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 59  | TaskFence(v, PromiseSettle(c))         | ⟨p, o, ⊤, a, P, A⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 60  | TaskFence(v, PromiseSettle(c))         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 61  | TaskFence(v, PromiseSettle(c))         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 62  | TaskFence(v, PromiseSettle(c))         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 63  | TaskFence(v, PromiseSettle(c))         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
