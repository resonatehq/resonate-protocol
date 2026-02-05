# Promise State Transitions

## States

| Symbol             | Description                         |
| ------------------ | ----------------------------------- |
| ⊥                  | Promise does not exist              |
| ⟨p, o, ⊥, ⊥, P, A⟩ | Pending                             |
| ⟨p, o, ⊥, a, P, A⟩ | Pending with target address         |
| ⟨p, o, ⊤, ⊥, P, A⟩ | Pending (timer)                     |
| ⟨p, o, ⊤, a, P, A⟩ | Pending (timer) with target address |
| ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | Resolved                            |
| ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected                            |
| ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (canceled)                 |
| ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (timedout)                 |

## Symbols

| Symbol | Description           |
| ------ | --------------------- |
| ⊤      | True                  |
| ⊥      | False                 |
| t      | Current time          |
| o      | Timeout time          |
| a      | Target address        |
| P      | Set of awaiter promises |
| A      | Set of addresses      |

## Operations

```
PromiseGet()
PromiseCreate(t, o, ⊥, ⊥)
PromiseCreate(t, o, ⊤, ⊥)
PromiseCreate(t, o, ⊥, a)
PromiseCreate(t, o, ⊤, a)
PromiseSettle(t, r)
PromiseSettle(t, x)
PromiseSettle(t, c)
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

| #   | Operation                 | Current State              | Next State            | Result | Side Effect(s)                                       |
| --- | ------------------------- | -------------------------- | --------------------- | ------ | ---------------------------------------------------- |
| 1   | PromiseGet()              | ⊥                          | ⊥                     | 404    |
| 2   | PromiseGet()              | ⟨p, o, ⊥, ⊥, P, A⟩         | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |
| 3   | PromiseGet()              | ⟨p, o, ⊥, a, P, A⟩         | ⟨p, o, ⊥, a, P, A⟩    | 200    |
| 4   | PromiseGet()              | ⟨p, o, ⊤, ⊥, P, A⟩         | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |
| 5   | PromiseGet()              | ⟨p, o, ⊤, a, P, A⟩         | ⟨p, o, ⊤, a, P, A⟩    | 200    |
| 6   | PromiseGet()              | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 7   | PromiseGet()              | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 8   | PromiseGet()              | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 9   | PromiseGet()              | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 10  | PromiseCreate(t, o, ⊥, ⊥) | ⊥ : t < o                  | ⟨p, o, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 11  | PromiseCreate(t, o, ⊥, ⊥) | ⊥ : t ≥ o                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 12  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |
| 13  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 14  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨p, o, ⊥, a, P, A⟩    | 200    |
| 15  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 16  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |
| 17  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 18  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨p, o, ⊤, a, P, A⟩    | 200    |
| 19  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 20  | PromiseCreate(t, o, ⊥, ⊥) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 21  | PromiseCreate(t, o, ⊥, ⊥) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 22  | PromiseCreate(t, o, ⊥, ⊥) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 23  | PromiseCreate(t, o, ⊥, ⊥) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 24  | PromiseCreate(t, o, ⊤, ⊥) | ⊥ : t < o                  | ⟨p, o, ⊤, ⊥, ∅, ∅⟩    | 200    |
| 25  | PromiseCreate(t, o, ⊤, ⊥) | ⊥ : t ≥ o                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 26  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |
| 27  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 28  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨p, o, ⊥, a, P, A⟩    | 200    |
| 29  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 30  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |
| 31  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 32  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨p, o, ⊤, a, P, A⟩    | 200    |
| 33  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 34  | PromiseCreate(t, o, ⊤, ⊥) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 35  | PromiseCreate(t, o, ⊤, ⊥) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 36  | PromiseCreate(t, o, ⊤, ⊥) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 37  | PromiseCreate(t, o, ⊤, ⊥) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 38  | PromiseCreate(t, o, ⊥, a) | ⊥ : t < o                  | ⟨p, o, ⊥, a, ∅, ∅⟩    | 200    | EnqueueInvoke                                        |
| 39  | PromiseCreate(t, o, ⊥, a) | ⊥ : t ≥ o                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 40  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |
| 41  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 42  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨p, o, ⊥, a, P, A⟩    | 200    |
| 43  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 44  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |
| 45  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 46  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨p, o, ⊤, a, P, A⟩    | 200    |
| 47  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 48  | PromiseCreate(t, o, ⊥, a) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 49  | PromiseCreate(t, o, ⊥, a) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 50  | PromiseCreate(t, o, ⊥, a) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 51  | PromiseCreate(t, o, ⊥, a) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 52  | PromiseCreate(t, o, ⊤, a) | ⊥ : t < o                  | ⟨p, o, ⊤, a, ∅, ∅⟩    | 200    | EnqueueInvoke                                        |
| 53  | PromiseCreate(t, o, ⊤, a) | ⊥ : t ≥ o                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 54  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |
| 55  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 56  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨p, o, ⊥, a, P, A⟩    | 200    |
| 57  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 58  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |
| 59  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 60  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨p, o, ⊤, a, P, A⟩    | 200    |
| 61  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 62  | PromiseCreate(t, o, ⊤, a) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 63  | PromiseCreate(t, o, ⊤, a) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 64  | PromiseCreate(t, o, ⊤, a) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 65  | PromiseCreate(t, o, ⊤, a) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 66  | PromiseSettle(t, r)       | ⊥                          | ⊥                     | 404    |
| 67  | PromiseSettle(t, r)       | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 68  | PromiseSettle(t, r)       | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 69  | PromiseSettle(t, r)       | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 70  | PromiseSettle(t, r)       | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 71  | PromiseSettle(t, r)       | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 72  | PromiseSettle(t, r)       | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 73  | PromiseSettle(t, r)       | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 74  | PromiseSettle(t, r)       | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 75  | PromiseSettle(t, r)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 76  | PromiseSettle(t, r)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 77  | PromiseSettle(t, r)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 78  | PromiseSettle(t, r)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 79  | PromiseSettle(t, x)       | ⊥                          | ⊥                     | 404    |
| 80  | PromiseSettle(t, x)       | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 81  | PromiseSettle(t, x)       | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 82  | PromiseSettle(t, x)       | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 83  | PromiseSettle(t, x)       | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 84  | PromiseSettle(t, x)       | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 85  | PromiseSettle(t, x)       | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 86  | PromiseSettle(t, x)       | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 87  | PromiseSettle(t, x)       | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 88  | PromiseSettle(t, x)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 89  | PromiseSettle(t, x)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 90  | PromiseSettle(t, x)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 91  | PromiseSettle(t, x)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 92  | PromiseSettle(t, c)       | ⊥                          | ⊥                     | 404    |
| 93  | PromiseSettle(t, c)       | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 94  | PromiseSettle(t, c)       | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 95  | PromiseSettle(t, c)       | ⟨p, o, ⊥, a, P, A⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 96  | PromiseSettle(t, c)       | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 97  | PromiseSettle(t, c)       | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 98  | PromiseSettle(t, c)       | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 99  | PromiseSettle(t, c)       | ⟨p, o, ⊤, a, P, A⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 100 | PromiseSettle(t, c)       | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 101 | PromiseSettle(t, c)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 102 | PromiseSettle(t, c)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 103 | PromiseSettle(t, c)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 104 | PromiseSettle(t, c)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 105 | PromiseRegister(p)        | ⊥                                    | ⊥                     | 404    |
| 106 | PromiseRegister(p)        | ⟨p, o, ⊥, ⊥, P, A⟩ : HasAddress(p)   | ⟨p, o, ⊥, ⊥, P::p, A⟩ | 200    |
| 107 | PromiseRegister(p)        | ⟨p, o, ⊥, ⊥, P, A⟩ : ¬HasAddress(p)  | ⟨p, o, ⊥, ⊥, P, A⟩    | 400    |
| 108 | PromiseRegister(p)        | ⟨p, o, ⊥, a, P, A⟩ : HasAddress(p)   | ⟨p, o, ⊥, a, P::p, A⟩ | 200    |
| 109 | PromiseRegister(p)        | ⟨p, o, ⊥, a, P, A⟩ : ¬HasAddress(p)  | ⟨p, o, ⊥, a, P, A⟩    | 400    |
| 110 | PromiseRegister(p)        | ⟨p, o, ⊤, ⊥, P, A⟩ : HasAddress(p)   | ⟨p, o, ⊤, ⊥, P::p, A⟩ | 200    |
| 111 | PromiseRegister(p)        | ⟨p, o, ⊤, ⊥, P, A⟩ : ¬HasAddress(p)  | ⟨p, o, ⊤, ⊥, P, A⟩    | 400    |
| 112 | PromiseRegister(p)        | ⟨p, o, ⊤, a, P, A⟩ : HasAddress(p)   | ⟨p, o, ⊤, a, P::p, A⟩ | 200    |
| 113 | PromiseRegister(p)        | ⟨p, o, ⊤, a, P, A⟩ : ¬HasAddress(p)  | ⟨p, o, ⊤, a, P, A⟩    | 400    |
| 114 | PromiseRegister(p)        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : HasAddress(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 115 | PromiseRegister(p)        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬HasAddress(p)  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 400    |
| 116 | PromiseRegister(p)        | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : HasAddress(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 117 | PromiseRegister(p)        | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬HasAddress(p)  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 400    |
| 118 | PromiseRegister(p)        | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : HasAddress(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 119 | PromiseRegister(p)        | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬HasAddress(p)  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 400    |
| 120 | PromiseRegister(p)        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : HasAddress(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 121 | PromiseRegister(p)        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬HasAddress(p)  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 400    |
| 122 | PromiseSubscribe(a)       | ⊥                                    | ⊥                     | 404    |
| 123 | PromiseSubscribe(a)       | ⟨p, o, ⊥, ⊥, P, A⟩                   | ⟨p, o, ⊥, ⊥, P, A::a⟩ | 200    |
| 124 | PromiseSubscribe(a)       | ⟨p, o, ⊥, a, P, A⟩                   | ⟨p, o, ⊥, a, P, A::a⟩ | 200    |
| 125 | PromiseSubscribe(a)       | ⟨p, o, ⊤, ⊥, P, A⟩                   | ⟨p, o, ⊤, ⊥, P, A::a⟩ | 200    |
| 126 | PromiseSubscribe(a)       | ⟨p, o, ⊤, a, P, A⟩                   | ⟨p, o, ⊤, a, P, A::a⟩ | 200    |
| 127 | PromiseSubscribe(a)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 128 | PromiseSubscribe(a)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 129 | PromiseSubscribe(a)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 130 | PromiseSubscribe(a)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| ~~131~~ | ~~Tick(t)~~           | ~~⊥~~                                | ~~⊥~~                 |        |
| 132 | Tick(t)                   | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o           | ⟨p, o, ⊥, ⊥, P, A⟩    |        |
| 133 | Tick(t)                   | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o           | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 134 | Tick(t)                   | ⟨p, o, ⊥, a, P, A⟩ : t < o           | ⟨p, o, ⊥, a, P, A⟩    |        |
| 135 | Tick(t)                   | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o           | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 136 | Tick(t)                   | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o           | ⟨p, o, ⊤, ⊥, P, A⟩    |        |
| 137 | Tick(t)                   | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o           | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueResume ∀p∈P, Send(Notify) ∀a∈A                |
| 138 | Tick(t)                   | ⟨p, o, ⊤, a, P, A⟩ : t < o           | ⟨p, o, ⊤, a, P, A⟩    |        |
| 139 | Tick(t)                   | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o           | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Notify) ∀a∈A |
| 140 | Tick(t)                   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |
| 141 | Tick(t)                   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |
| 142 | Tick(t)                   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |
| 143 | Tick(t)                   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |
