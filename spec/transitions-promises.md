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
PromiseCreate(t, o, ⊥, ⊥, r)
PromiseCreate(t, o, ⊥, ⊥, x)
PromiseCreate(t, o, ⊥, ⊥, c)
PromiseCreate(t, o, ⊤, ⊥, r)
PromiseCreate(t, o, ⊤, ⊥, x)
PromiseCreate(t, o, ⊤, ⊥, c)
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
| 66      | PromiseCreate(t, o, ⊥, ⊥, r) | ⊥ : t < o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 67      | PromiseCreate(t, o, ⊥, ⊥, r) | ⊥ : t ≥ o                                                         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 68      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 69      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 70      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 71      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 72      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 73      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 74      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 75      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 76      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 77      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 78      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 79      | PromiseCreate(t, o, ⊥, ⊥, r) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 80      | PromiseCreate(t, o, ⊥, ⊥, x) | ⊥ : t < o                                                         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 81      | PromiseCreate(t, o, ⊥, ⊥, x) | ⊥ : t ≥ o                                                         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 82      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 83      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 84      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 85      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 86      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 87      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 88      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 89      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 90      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 91      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 92      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 93      | PromiseCreate(t, o, ⊥, ⊥, x) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 94      | PromiseCreate(t, o, ⊥, ⊥, c) | ⊥ : t < o                                                         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 95      | PromiseCreate(t, o, ⊥, ⊥, c) | ⊥ : t ≥ o                                                         | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 96      | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 97      | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 98      | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 99      | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 100     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 101     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 102     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 103     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 104     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 105     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 106     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 107     | PromiseCreate(t, o, ⊥, ⊥, c) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 108     | PromiseCreate(t, o, ⊤, ⊥, r) | ⊥ : t < o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 109     | PromiseCreate(t, o, ⊤, ⊥, r) | ⊥ : t ≥ o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 110     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 111     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 112     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 113     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 114     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 115     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 116     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 117     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 118     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 119     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 120     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 121     | PromiseCreate(t, o, ⊤, ⊥, r) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 122     | PromiseCreate(t, o, ⊤, ⊥, x) | ⊥ : t < o                                                         | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 123     | PromiseCreate(t, o, ⊤, ⊥, x) | ⊥ : t ≥ o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 124     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 125     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 126     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 127     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 128     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 129     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 130     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 131     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 132     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 133     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 134     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 135     | PromiseCreate(t, o, ⊤, ⊥, x) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 136     | PromiseCreate(t, o, ⊤, ⊥, c) | ⊥ : t < o                                                         | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 137     | PromiseCreate(t, o, ⊤, ⊥, c) | ⊥ : t ≥ o                                                         | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 138     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊥, ⊥, P, A⟩     | 200    |  |
| 139     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 140     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊥, a, P, A⟩ : t < o                                        | ⟨p, o, ⊥, a, P, A⟩     | 200    |  |
| 141     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                        | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 142     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                        | ⟨p, o, ⊤, ⊥, P, A⟩     | 200    |  |
| 143     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 144     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊤, a, P, A⟩ : t < o                                        | ⟨p, o, ⊤, a, P, A⟩     | 200    |  |
| 145     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                        | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 146     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 147     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 148     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 149     | PromiseCreate(t, o, ⊤, ⊥, c) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                                | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩     | 200    |  |
| 150     | PromiseSettle(r)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 151     | PromiseSettle(r)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 152     | PromiseSettle(r)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 153     | PromiseSettle(r)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 154     | PromiseSettle(r)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 155     | PromiseSettle(r)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 156     | PromiseSettle(r)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 157     | PromiseSettle(r)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 158     | PromiseSettle(r)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 159     | PromiseSettle(x)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 160     | PromiseSettle(x)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 161     | PromiseSettle(x)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 162     | PromiseSettle(x)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 163     | PromiseSettle(x)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 164     | PromiseSettle(x)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 165     | PromiseSettle(x)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 166     | PromiseSettle(x)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 167     | PromiseSettle(x)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 168     | PromiseSettle(c)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 169     | PromiseSettle(c)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 170     | PromiseSettle(c)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 171     | PromiseSettle(c)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 172     | PromiseSettle(c)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 173     | PromiseSettle(c)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 174     | PromiseSettle(c)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 175     | PromiseSettle(c)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 176     | PromiseSettle(c)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 177     | PromiseRegisterCallback(p)   | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 178     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊥, ⊥, P, A⟩    | 422    |                                                      |
| 179     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊥, ⊥, P, A⟩    | 422    |                                                      |
| 180     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊥, ⊥, P::p, A⟩ | 200    |                                                      |
| 181     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 182     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊥, a, P, A⟩    | 422    |                                                      |
| 183     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊥, a, P, A⟩    | 422    |                                                      |
| 184     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊥, a, P::p, A⟩ | 200    |                                                      |
| 185     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 186     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊤, ⊥, P, A⟩    | 422    |                                                      |
| 187     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊤, ⊥, P, A⟩    | 422    |                                                      |
| 188     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊤, ⊥, P::p, A⟩ | 200    |                                                      |
| 189     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 190     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊤, a, P, A⟩    | 422    |                                                      |
| 191     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊤, a, P, A⟩    | 422    |                                                      |
| 192     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊤, a, P::p, A⟩ | 200    |                                                      |
| 193     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 194     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 195     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 196     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 197     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 198     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 199     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 200     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 201     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 202     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 203     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 204     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 205     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume                                        |
| 206     | PromiseRegisterListener(a)   | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 207     | PromiseRegisterListener(a)   | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨p, o, ⊥, ⊥, P, A::a⟩ | 200    |                                                      |
| 208     | PromiseRegisterListener(a)   | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨p, o, ⊥, a, P, A::a⟩ | 200    |                                                      |
| 209     | PromiseRegisterListener(a)   | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨p, o, ⊤, ⊥, P, A::a⟩ | 200    |                                                      |
| 210     | PromiseRegisterListener(a)   | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨p, o, ⊤, a, P, A::a⟩ | 200    |                                                      |
| 211     | PromiseRegisterListener(a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 212     | PromiseRegisterListener(a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 213     | PromiseRegisterListener(a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 214     | PromiseRegisterListener(a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| ~~215~~ | ~~Tick(t)~~                  | ~~⊥~~                                                             | ~~⊥~~                  |        |                                                      |
| 216     | Tick(t)                      | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    |        |                                                      |
| 217     | Tick(t)                      | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    |        |                                                        |
| 218     | Tick(t)                      | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    |        |                                                      |
| 219     | Tick(t)                      | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 220     | Tick(t)                      | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    |        |                                                      |
| 221     | Tick(t)                      | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    |        |                                                        |
| 222     | Tick(t)                      | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    |        |                                                      |
| 223     | Tick(t)                      | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 224     | Tick(t)                      | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 225     | Tick(t)                      | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 226     | Tick(t)                      | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 227     | Tick(t)                      | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
