# Promise State Transitions

## States

| Symbol              | Description                         |
| ------------------- | ----------------------------------- |
| ⊥                   | Promise does not exist              |
| ⟨p, o, ⊥, ⊥, P, A⟩ | Pending                             |
| ⟨p, o, ⊥, a, P, A⟩ | Pending with target address         |
| ⟨p, o, ⊤, ⊥, P, A⟩ | Pending (timer)                     |
| ⟨p, o, ⊤, a, P, A⟩ | Pending (timer) with target address |
| ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | Resolved                            |
| ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected                            |
| ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (canceled)                 |
| ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (timedout)                 |

## Symbols

| Symbol | Description             |
| ------ | ----------------------- |
| ⊤      | True                    |
| ⊥      | False                   |
| t      | Current time            |
| o      | Timeout time            |
| a      | Target address          |
| P      | Set of awaiter promises |
| A      | Set of addresses        |

## Operations

```
PromiseGet()
PromiseCreate(o, ⊥, ⊥)
PromiseCreate(o, ⊤, ⊥)
PromiseCreate(o, ⊥, a)
PromiseCreate(o, ⊤, a)
PromiseSettle(r)
PromiseSettle(x)
PromiseSettle(c)
PromiseRegister(p)
PromiseSubscribe(a)
Tick(t)
```

## Side Effects

| Side Effect   | Description    |
| ------------- | -------------- |
| EnqueueInvoke | Enqueue invoke |
| EnqueueResume | Enqueue resume |
| EnqueueSettle | Enqueue settle |
| Send(Notify)  | Send notify    |

## Transitions

| #   | Operation                 | Current State                             | Next State            | Result | Side Effect(s)                                       |
| --- | ------------------------- | ----------------------------------------- | --------------------- | ------ | ---------------------------------------------------- |
| 1   | PromiseGet()              | ⊥                                         | ⊥                     | 404    |                                                      |
| 2   | PromiseGet()              | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 3   | PromiseGet()              | ⟨p, o, ⊥, a, P, A⟩                       | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 4   | PromiseGet()              | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 5   | PromiseGet()              | ⟨p, o, ⊤, a, P, A⟩                       | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 6   | PromiseGet()              | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 7   | PromiseGet()              | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 8   | PromiseGet()              | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 9   | PromiseGet()              | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 10  | PromiseCreate(o, ⊥, ⊥)   | ⊥                                         | ⟨p, o, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 11  | PromiseCreate(o, ⊥, ⊥)   | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 12  | PromiseCreate(o, ⊥, ⊥)   | ⟨p, o, ⊥, a, P, A⟩                       | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 13  | PromiseCreate(o, ⊥, ⊥)   | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 14  | PromiseCreate(o, ⊥, ⊥)   | ⟨p, o, ⊤, a, P, A⟩                       | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 15  | PromiseCreate(o, ⊥, ⊥)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 16  | PromiseCreate(o, ⊥, ⊥)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 17  | PromiseCreate(o, ⊥, ⊥)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 18  | PromiseCreate(o, ⊥, ⊥)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 19  | PromiseCreate(o, ⊤, ⊥)   | ⊥                                         | ⟨p, o, ⊤, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 20  | PromiseCreate(o, ⊤, ⊥)   | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 21  | PromiseCreate(o, ⊤, ⊥)   | ⟨p, o, ⊥, a, P, A⟩                       | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 22  | PromiseCreate(o, ⊤, ⊥)   | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 23  | PromiseCreate(o, ⊤, ⊥)   | ⟨p, o, ⊤, a, P, A⟩                       | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 24  | PromiseCreate(o, ⊤, ⊥)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 25  | PromiseCreate(o, ⊤, ⊥)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 26  | PromiseCreate(o, ⊤, ⊥)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 27  | PromiseCreate(o, ⊤, ⊥)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 28  | PromiseCreate(o, ⊥, a)   | ⊥                                         | ⟨p, o, ⊥, a, ∅, ∅⟩   | 200    | EnqueueInvoke                                        |
| 29  | PromiseCreate(o, ⊥, a)   | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 30  | PromiseCreate(o, ⊥, a)   | ⟨p, o, ⊥, a, P, A⟩                       | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 31  | PromiseCreate(o, ⊥, a)   | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 32  | PromiseCreate(o, ⊥, a)   | ⟨p, o, ⊤, a, P, A⟩                       | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 33  | PromiseCreate(o, ⊥, a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 34  | PromiseCreate(o, ⊥, a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 35  | PromiseCreate(o, ⊥, a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 36  | PromiseCreate(o, ⊥, a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 37  | PromiseCreate(o, ⊤, a)   | ⊥                                         | ⟨p, o, ⊤, a, ∅, ∅⟩   | 200    | EnqueueInvoke                                        |
| 38  | PromiseCreate(o, ⊤, a)   | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 39  | PromiseCreate(o, ⊤, a)   | ⟨p, o, ⊥, a, P, A⟩                       | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 40  | PromiseCreate(o, ⊤, a)   | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 41  | PromiseCreate(o, ⊤, a)   | ⟨p, o, ⊤, a, P, A⟩                       | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 42  | PromiseCreate(o, ⊤, a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 43  | PromiseCreate(o, ⊤, a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 44  | PromiseCreate(o, ⊤, a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 45  | PromiseCreate(o, ⊤, a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 46  | PromiseSettle(r)         | ⊥                                         | ⊥                     | 404    |                                                      |
| 47  | PromiseSettle(r)         | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 48  | PromiseSettle(r)         | ⟨p, o, ⊥, a, P, A⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 49  | PromiseSettle(r)         | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 50  | PromiseSettle(r)         | ⟨p, o, ⊤, a, P, A⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 51  | PromiseSettle(r)         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 52  | PromiseSettle(r)         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 53  | PromiseSettle(r)         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 54  | PromiseSettle(r)         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 55  | PromiseSettle(x)         | ⊥                                         | ⊥                     | 404    |                                                      |
| 56  | PromiseSettle(x)         | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 57  | PromiseSettle(x)         | ⟨p, o, ⊥, a, P, A⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 58  | PromiseSettle(x)         | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 59  | PromiseSettle(x)         | ⟨p, o, ⊤, a, P, A⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 60  | PromiseSettle(x)         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 61  | PromiseSettle(x)         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 62  | PromiseSettle(x)         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 63  | PromiseSettle(x)         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 64  | PromiseSettle(c)         | ⊥                                         | ⊥                     | 404    |                                                      |
| 65  | PromiseSettle(c)         | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 66  | PromiseSettle(c)         | ⟨p, o, ⊥, a, P, A⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 67  | PromiseSettle(c)         | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 68  | PromiseSettle(c)         | ⟨p, o, ⊤, a, P, A⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 69  | PromiseSettle(c)         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 70  | PromiseSettle(c)         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 71  | PromiseSettle(c)         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 72  | PromiseSettle(c)         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 73  | PromiseRegister(p)       | ⊥                                                          | ⊥                     | 404    |                                                      |
| 74  | PromiseRegister(p)       | ⟨p, o, ⊥, ⊥, P, A⟩ : ¬Exists(p)                           | ⟨p, o, ⊥, ⊥, P, A⟩   | 422    |                                                      |
| 75  | PromiseRegister(p)       | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨p, o, ⊥, ⊥, P, A⟩   | 422    |                                                      |
| 76  | PromiseRegister(p)       | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p) | ⟨p, o, ⊥, ⊥, P::p, A⟩ | 200    |                                                      |
| 77  | PromiseRegister(p)       | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ ¬Pending(p) | ⟨p, o, ⊥, ⊥, P, A⟩   | 200    |                                                      |
| 78  | PromiseRegister(p)       | ⟨p, o, ⊥, a, P, A⟩ : ¬Exists(p)                           | ⟨p, o, ⊥, a, P, A⟩   | 422    |                                                      |
| 79  | PromiseRegister(p)       | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨p, o, ⊥, a, P, A⟩   | 422    |                                                      |
| 80  | PromiseRegister(p)       | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p) | ⟨p, o, ⊥, a, P::p, A⟩ | 200    |                                                      |
| 81  | PromiseRegister(p)       | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ ¬Pending(p) | ⟨p, o, ⊥, a, P, A⟩   | 200    |                                                      |
| 82  | PromiseRegister(p)       | ⟨p, o, ⊤, ⊥, P, A⟩ : ¬Exists(p)                           | ⟨p, o, ⊤, ⊥, P, A⟩   | 422    |                                                      |
| 83  | PromiseRegister(p)       | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨p, o, ⊤, ⊥, P, A⟩   | 422    |                                                      |
| 84  | PromiseRegister(p)       | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p) | ⟨p, o, ⊤, ⊥, P::p, A⟩ | 200    |                                                      |
| 85  | PromiseRegister(p)       | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ ¬Pending(p) | ⟨p, o, ⊤, ⊥, P, A⟩   | 200    |                                                      |
| 86  | PromiseRegister(p)       | ⟨p, o, ⊤, a, P, A⟩ : ¬Exists(p)                           | ⟨p, o, ⊤, a, P, A⟩   | 422    |                                                      |
| 87  | PromiseRegister(p)       | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨p, o, ⊤, a, P, A⟩   | 422    |                                                      |
| 88  | PromiseRegister(p)       | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p) | ⟨p, o, ⊤, a, P::p, A⟩ | 200    |                                                      |
| 89  | PromiseRegister(p)       | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ ¬Pending(p) | ⟨p, o, ⊤, a, P, A⟩   | 200    |                                                      |
| 90  | PromiseRegister(p)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                           | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 91  | PromiseRegister(p)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 92  | PromiseRegister(p)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)           | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 93  | PromiseRegister(p)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                           | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 94  | PromiseRegister(p)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 95  | PromiseRegister(p)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)           | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 96  | PromiseRegister(p)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                           | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 97  | PromiseRegister(p)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 98  | PromiseRegister(p)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)           | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 99  | PromiseRegister(p)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                           | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 100 | PromiseRegister(p)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)          | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 422    |                                                      |
| 101 | PromiseRegister(p)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)           | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 102 | PromiseSubscribe(a)      | ⊥                                         | ⊥                     | 404    |                                                      |
| 103 | PromiseSubscribe(a)      | ⟨p, o, ⊥, ⊥, P, A⟩                       | ⟨p, o, ⊥, ⊥, P, A::a⟩ | 200    |                                                      |
| 104 | PromiseSubscribe(a)      | ⟨p, o, ⊥, a, P, A⟩                       | ⟨p, o, ⊥, a, P, A::a⟩ | 200    |                                                      |
| 105 | PromiseSubscribe(a)      | ⟨p, o, ⊤, ⊥, P, A⟩                       | ⟨p, o, ⊤, ⊥, P, A::a⟩ | 200    |                                                      |
| 106 | PromiseSubscribe(a)      | ⟨p, o, ⊤, a, P, A⟩                       | ⟨p, o, ⊤, a, P, A::a⟩ | 200    |                                                      |
| 107 | PromiseSubscribe(a)      | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 108 | PromiseSubscribe(a)      | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 109 | PromiseSubscribe(a)      | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| 110 | PromiseSubscribe(a)      | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   | 200    |                                                      |
| ~~111~~ | ~~Tick(t)~~           | ~~⊥~~                                     | ~~⊥~~                 |        |                                                      |
| 112 | Tick(t)                   | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o               | ⟨p, o, ⊥, ⊥, P, A⟩   |        |                                                      |
| 113 | Tick(t)                   | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   |        | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 114 | Tick(t)                   | ⟨p, o, ⊥, a, P, A⟩ : t < o               | ⟨p, o, ⊥, a, P, A⟩   |        |                                                      |
| 115 | Tick(t)                   | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 116 | Tick(t)                   | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o               | ⟨p, o, ⊤, ⊥, P, A⟩   |        |                                                      |
| 117 | Tick(t)                   | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   |        | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 118 | Tick(t)                   | ⟨p, o, ⊤, a, P, A⟩ : t < o               | ⟨p, o, ⊤, a, P, A⟩   |        |                                                      |
| 119 | Tick(t)                   | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 120 | Tick(t)                   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩   |        |                                                      |
| 121 | Tick(t)                   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩   |        |                                                      |
| 122 | Tick(t)                   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩   |        |                                                      |
| 123 | Tick(t)                   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩   |        |                                                      |
