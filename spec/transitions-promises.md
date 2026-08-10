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
| ¬      | Negation                |
| t      | Current time            |
| o      | Timeout time            |
| s      | Terminal state (r, x, c) |
| a      | Target address          |
| P      | Set of awaiter promises |
| A      | Set of addresses        |

## Operations

```
PromiseGet()
PromiseCreate(t, o, ⊥, ⊥)
PromiseCreate(t, o, ⊤, ⊥)
PromiseCreate(t, o, ⊥, a)
PromiseCreate(t, o, ⊤, a)
PromiseCreate(t, o, ⊥, ⊥, s)
PromiseCreate(t, o, ⊤, ⊥, s)
PromiseSettle(r)
PromiseSettle(x)
PromiseSettle(c)
PromiseRegisterCallback(p)
PromiseRegisterListener(a)
Tick(t)
```

## Side Effects

| Side Effect   | Description    |
| ------------- | -------------- |
| EnqueueInvoke | Enqueue invoke |
| EnqueueResume | Enqueue resume |
| EnqueueSettle | Enqueue settle |
| Send(Unblock) | Send unblock   |

## Predicates

| Predicate     | Description                    |
| ------------- | ------------------------------ |
| Exists(p)     | Promise p exists               |
| Pending(p)    | Promise p is pending           |
| Settled(p)    | Promise p is settled           |
| HasAddress(p) | Promise p has a target address |

## Transitions

| #       | Operation                    | Current State                                                     | Next State             | Result | Side Effect(s)                                       |
| ------- | ---------------------------- | ----------------------------------------------------------------- | ---------------------- | ------ | ---------------------------------------------------- |
| 1       | PromiseGet()                 | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 2       | PromiseGet()                 | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 3       | PromiseGet()                 | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 4       | PromiseGet()                 | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 5       | PromiseGet()                 | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 6       | PromiseGet()                 | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 7       | PromiseGet()                 | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 8       | PromiseGet()                 | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 9       | PromiseGet()                 | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 10      | PromiseCreate(t, o, ⊥, ⊥)   | ⊥ : t < o                                                         | ⟨p, o, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 11      | PromiseCreate(t, o, ⊥, ⊥)   | ⊥ : t ≥ o                                                         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 12      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 13      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 14      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 15      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 16      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 17      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 18      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 19      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 20      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 21      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 22      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 23      | PromiseCreate(t, o, ⊥, ⊥)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 24      | PromiseCreate(t, o, ⊤, ⊥)   | ⊥ : t < o                                                         | ⟨p, o, ⊤, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 25      | PromiseCreate(t, o, ⊤, ⊥)   | ⊥ : t ≥ o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 26      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 27      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 28      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 29      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 30      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 31      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 32      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 33      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 34      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 35      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 36      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 37      | PromiseCreate(t, o, ⊤, ⊥)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 38      | PromiseCreate(t, o, ⊥, a)   | ⊥ : t < o                                                         | ⟨p, o, ⊥, a, ∅, ∅⟩    | 200    | EnqueueInvoke                                        |
| 39      | PromiseCreate(t, o, ⊥, a)   | ⊥ : t ≥ o                                                         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle                                        |
| 40      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 41      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 42      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 43      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 44      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 45      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 46      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 47      | PromiseCreate(t, o, ⊥, a)   | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 48      | PromiseCreate(t, o, ⊥, a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 49      | PromiseCreate(t, o, ⊥, a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 50      | PromiseCreate(t, o, ⊥, a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 51      | PromiseCreate(t, o, ⊥, a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 52      | PromiseCreate(t, o, ⊤, a)   | ⊥ : t < o                                                         | ⟨p, o, ⊤, a, ∅, ∅⟩    | 200    | EnqueueInvoke                                        |
| 53      | PromiseCreate(t, o, ⊤, a)   | ⊥ : t ≥ o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle                                        |
| 54      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 55      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 56      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 57      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 58      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 59      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 60      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 61      | PromiseCreate(t, o, ⊤, a)   | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 62      | PromiseCreate(t, o, ⊤, a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 63      | PromiseCreate(t, o, ⊤, a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 64      | PromiseCreate(t, o, ⊤, a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 65      | PromiseCreate(t, o, ⊤, a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 66      | PromiseCreate(t, o, ⊥, ⊥, s) | ⊥ : t < o                                                         | ⟨s, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 67      | PromiseCreate(t, o, ⊥, ⊥, s) | ⊥ : t ≥ o                                                         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 68      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 69      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 70      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 71      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 72      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 73      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 74      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 75      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 76      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 77      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 78      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 79      | PromiseCreate(t, o, ⊥, ⊥, s) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 80      | PromiseCreate(t, o, ⊤, ⊥, s) | ⊥ : t < o                                                         | ⟨s, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 81      | PromiseCreate(t, o, ⊤, ⊥, s) | ⊥ : t ≥ o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 82      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 83      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 84      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 85      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 86      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 87      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 88      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 89      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 90      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 91      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 92      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 93      | PromiseCreate(t, o, ⊤, ⊥, s) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 94      | PromiseSettle(r)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 95      | PromiseSettle(r)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 96      | PromiseSettle(r)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 97      | PromiseSettle(r)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 98      | PromiseSettle(r)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 99      | PromiseSettle(r)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 100     | PromiseSettle(r)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 101     | PromiseSettle(r)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 102     | PromiseSettle(r)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 103     | PromiseSettle(x)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 104     | PromiseSettle(x)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 105     | PromiseSettle(x)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 106     | PromiseSettle(x)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 107     | PromiseSettle(x)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 108     | PromiseSettle(x)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 109     | PromiseSettle(x)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 110     | PromiseSettle(x)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 111     | PromiseSettle(x)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 112     | PromiseSettle(c)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 113     | PromiseSettle(c)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 114     | PromiseSettle(c)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 115     | PromiseSettle(c)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 116     | PromiseSettle(c)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 117     | PromiseSettle(c)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 118     | PromiseSettle(c)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 119     | PromiseSettle(c)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 120     | PromiseSettle(c)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 121     | PromiseRegisterCallback(p)   | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 122     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊥, ⊥, P, A⟩    | 422    |                                                      |
| 123     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊥, ⊥, P, A⟩    | 422    |                                                      |
| 124     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊥, ⊥, P::p, A⟩ | 200    |                                                      |
| 125     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 126     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊥, a, P, A⟩    | 422    |                                                      |
| 127     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊥, a, P, A⟩    | 422    |                                                      |
| 128     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊥, a, P::p, A⟩ | 200    |                                                      |
| 129     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 130     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊤, ⊥, P, A⟩    | 422    |                                                      |
| 131     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊤, ⊥, P, A⟩    | 422    |                                                      |
| 132     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊤, ⊥, P::p, A⟩ | 200    |                                                      |
| 133     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 134     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊤, a, P, A⟩    | 422    |                                                      |
| 135     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊤, a, P, A⟩    | 422    |                                                      |
| 136     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊤, a, P::p, A⟩ | 200    |                                                      |
| 137     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 138     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 139     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 140     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 141     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 142     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 143     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 144     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 145     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 146     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 147     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 148     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 149     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 150     | PromiseRegisterListener(a)   | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 151     | PromiseRegisterListener(a)   | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨p, o, ⊥, ⊥, P, A::a⟩ | 200    |                                                      |
| 152     | PromiseRegisterListener(a)   | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨p, o, ⊥, a, P, A::a⟩ | 200    |                                                      |
| 153     | PromiseRegisterListener(a)   | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨p, o, ⊤, ⊥, P, A::a⟩ | 200    |                                                      |
| 154     | PromiseRegisterListener(a)   | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨p, o, ⊤, a, P, A::a⟩ | 200    |                                                      |
| 155     | PromiseRegisterListener(a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 156     | PromiseRegisterListener(a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 157     | PromiseRegisterListener(a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 158     | PromiseRegisterListener(a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| ~~159~~ | ~~Tick(t)~~                  | ~~⊥~~                                                             | ~~⊥~~                  |        |                                                      |
| 160     | Tick(t)                      | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    |        |                                                      |
| 161     | Tick(t)                      | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    |        |                                                        |
| 162     | Tick(t)                      | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    |        |                                                      |
| 163     | Tick(t)                      | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 164     | Tick(t)                      | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    |        |                                                      |
| 165     | Tick(t)                      | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    |        |                                                        |
| 166     | Tick(t)                      | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    |        |                                                      |
| 167     | Tick(t)                      | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 168     | Tick(t)                      | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 169     | Tick(t)                      | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 170     | Tick(t)                      | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 171     | Tick(t)                      | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
