# Promise State Transitions

## States

| Symbol             | Description                         |
| ------------------ | ----------------------------------- |
| ⊥                  | Promise does not exist              |
| ⟨p, o, ⊥, ⊥, ∅, S⟩ | Pending                             |
| ⟨p, o, ⊥, a, C, S⟩ | Pending with target address         |
| ⟨p, o, ⊤, ⊥, ∅, S⟩ | Pending (timer)                     |
| ⟨p, o, ⊤, a, C, S⟩ | Pending (timer) with target address |
| ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | Resolved                            |
| ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected                            |
| ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (canceled)                 |
| ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (timedout)                 |

## Symbols

| Symbol | Description          |
| ------ | -------------------- |
| ⊤      | True                 |
| ⊥      | False                |
| t      | Current time         |
| o      | Timeout time         |
| a      | Target address       |
| C      | Set of callbacks     |
| S      | Set of subscriptions |

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
PromiseRegister(c)
PromiseSubscribe(s)
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
| 2   | PromiseGet()              | ⟨p, o, ⊥, ⊥, ∅, S⟩         | ⟨p, o, ⊥, ⊥, ∅, S⟩    | 200    |
| 3   | PromiseGet()              | ⟨p, o, ⊥, a, C, S⟩         | ⟨p, o, ⊥, a, C, S⟩    | 200    |
| 4   | PromiseGet()              | ⟨p, o, ⊤, ⊥, ∅, S⟩         | ⟨p, o, ⊤, ⊥, ∅, S⟩    | 200    |
| 5   | PromiseGet()              | ⟨p, o, ⊤, a, C, S⟩         | ⟨p, o, ⊤, a, C, S⟩    | 200    |
| 6   | PromiseGet()              | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 7   | PromiseGet()              | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 8   | PromiseGet()              | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 9   | PromiseGet()              | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 10  | PromiseCreate(t, o, ⊥, ⊥) | ⊥ : t < o                  | ⟨p, o, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 11  | PromiseCreate(t, o, ⊥, ⊥) | ⊥ : t ≥ o                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 12  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩    | 200    |
| 13  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 14  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩    | 200    |
| 15  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 16  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩    | 200    |
| 17  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 18  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩    | 200    |
| 19  | PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 20  | PromiseCreate(t, o, ⊥, ⊥) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 21  | PromiseCreate(t, o, ⊥, ⊥) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 22  | PromiseCreate(t, o, ⊥, ⊥) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 23  | PromiseCreate(t, o, ⊥, ⊥) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 24  | PromiseCreate(t, o, ⊤, ⊥) | ⊥ : t < o                  | ⟨p, o, ⊤, ⊥, ∅, ∅⟩    | 200    |
| 25  | PromiseCreate(t, o, ⊤, ⊥) | ⊥ : t ≥ o                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 26  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩    | 200    |
| 27  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 28  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩    | 200    |
| 29  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 30  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩    | 200    |
| 31  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 32  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩    | 200    |
| 33  | PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 34  | PromiseCreate(t, o, ⊤, ⊥) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 35  | PromiseCreate(t, o, ⊤, ⊥) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 36  | PromiseCreate(t, o, ⊤, ⊥) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 37  | PromiseCreate(t, o, ⊤, ⊥) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 38  | PromiseCreate(t, o, ⊥, a) | ⊥ : t < o                  | ⟨p, o, ⊥, a, ∅, ∅⟩    | 200    | EnqueueInvoke                                        |
| 39  | PromiseCreate(t, o, ⊥, a) | ⊥ : t ≥ o                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 40  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩    | 200    |
| 41  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 42  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩    | 200    |
| 43  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 44  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩    | 200    |
| 45  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 46  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩    | 200    |
| 47  | PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 48  | PromiseCreate(t, o, ⊥, a) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 49  | PromiseCreate(t, o, ⊥, a) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 50  | PromiseCreate(t, o, ⊥, a) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 51  | PromiseCreate(t, o, ⊥, a) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 52  | PromiseCreate(t, o, ⊤, a) | ⊥ : t < o                  | ⟨p, o, ⊤, a, ∅, ∅⟩    | 200    | EnqueueInvoke                                        |
| 53  | PromiseCreate(t, o, ⊤, a) | ⊥ : t ≥ o                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 54  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩    | 200    |
| 55  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 56  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩    | 200    |
| 57  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 58  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩    | 200    |
| 59  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 60  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩    | 200    |
| 61  | PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 62  | PromiseCreate(t, o, ⊤, a) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 63  | PromiseCreate(t, o, ⊤, a) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 64  | PromiseCreate(t, o, ⊤, a) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 65  | PromiseCreate(t, o, ⊤, a) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 66  | PromiseSettle(t, r)       | ⊥                          | ⊥                     | 404    |
| 67  | PromiseSettle(t, r)       | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 68  | PromiseSettle(t, r)       | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 69  | PromiseSettle(t, r)       | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 70  | PromiseSettle(t, r)       | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 71  | PromiseSettle(t, r)       | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 72  | PromiseSettle(t, r)       | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 73  | PromiseSettle(t, r)       | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 74  | PromiseSettle(t, r)       | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 75  | PromiseSettle(t, r)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 76  | PromiseSettle(t, r)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 77  | PromiseSettle(t, r)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 78  | PromiseSettle(t, r)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 79  | PromiseSettle(t, x)       | ⊥                          | ⊥                     | 404    |
| 80  | PromiseSettle(t, x)       | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 81  | PromiseSettle(t, x)       | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 82  | PromiseSettle(t, x)       | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 83  | PromiseSettle(t, x)       | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 84  | PromiseSettle(t, x)       | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 85  | PromiseSettle(t, x)       | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 86  | PromiseSettle(t, x)       | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 87  | PromiseSettle(t, x)       | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 88  | PromiseSettle(t, x)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 89  | PromiseSettle(t, x)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 90  | PromiseSettle(t, x)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 91  | PromiseSettle(t, x)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 92  | PromiseSettle(t, c)       | ⊥                          | ⊥                     | 404    |
| 93  | PromiseSettle(t, c)       | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 94  | PromiseSettle(t, c)       | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 95  | PromiseSettle(t, c)       | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 96  | PromiseSettle(t, c)       | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 97  | PromiseSettle(t, c)       | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 98  | PromiseSettle(t, c)       | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | Send(Notify) ∀s∈S                                    |
| 99  | PromiseSettle(t, c)       | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 100 | PromiseSettle(t, c)       | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| 101 | PromiseSettle(t, c)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 102 | PromiseSettle(t, c)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 103 | PromiseSettle(t, c)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 104 | PromiseSettle(t, c)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 105 | PromiseRegister(c)        | ⊥                          | ⊥                     | 404    |
| 106 | PromiseRegister(c)        | ⟨p, o, ⊥, ⊥, ∅, S⟩         | ⟨p, o, ⊥, ⊥, ∅, S⟩    | 200    |
| 107 | PromiseRegister(c)        | ⟨p, o, ⊥, a, C, S⟩         | ⟨p, o, ⊥, a, C::c, S⟩ | 200    |
| 108 | PromiseRegister(c)        | ⟨p, o, ⊤, ⊥, ∅, S⟩         | ⟨p, o, ⊤, ⊥, ∅, S⟩    | 200    |
| 109 | PromiseRegister(c)        | ⟨p, o, ⊤, a, C, S⟩         | ⟨p, o, ⊤, a, C::c, S⟩ | 200    |
| 110 | PromiseRegister(c)        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 111 | PromiseRegister(c)        | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 112 | PromiseRegister(c)        | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 113 | PromiseRegister(c)        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 114 | PromiseSubscribe(s)       | ⊥                          | ⊥                     | 404    |
| 115 | PromiseSubscribe(s)       | ⟨p, o, ⊥, ⊥, ∅, S⟩         | ⟨p, o, ⊥, ⊥, ∅, S::s⟩ | 200    |
| 116 | PromiseSubscribe(s)       | ⟨p, o, ⊥, a, C, S⟩         | ⟨p, o, ⊥, a, C, S::s⟩ | 200    |
| 117 | PromiseSubscribe(s)       | ⟨p, o, ⊤, ⊥, ∅, S⟩         | ⟨p, o, ⊤, ⊥, ∅, S::s⟩ | 200    |
| 118 | PromiseSubscribe(s)       | ⟨p, o, ⊤, a, C, S⟩         | ⟨p, o, ⊤, a, C, S::s⟩ | 200    |
| 119 | PromiseSubscribe(s)       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 120 | PromiseSubscribe(s)       | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 121 | PromiseSubscribe(s)       | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
| 122 | PromiseSubscribe(s)       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |
