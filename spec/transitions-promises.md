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
| 66      | PromiseSettle(r)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 67      | PromiseSettle(r)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 68      | PromiseSettle(r)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 69      | PromiseSettle(r)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 70      | PromiseSettle(r)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 71      | PromiseSettle(r)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 72      | PromiseSettle(r)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 73      | PromiseSettle(r)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 74      | PromiseSettle(r)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 75      | PromiseSettle(x)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 76      | PromiseSettle(x)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 77      | PromiseSettle(x)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 78      | PromiseSettle(x)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 79      | PromiseSettle(x)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 80      | PromiseSettle(x)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 81      | PromiseSettle(x)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 82      | PromiseSettle(x)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 83      | PromiseSettle(x)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 84      | PromiseSettle(c)             | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 85      | PromiseSettle(c)             | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 86      | PromiseSettle(c)             | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 87      | PromiseSettle(c)             | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 88      | PromiseSettle(c)             | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 89      | PromiseSettle(c)             | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 90      | PromiseSettle(c)             | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 91      | PromiseSettle(c)             | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 92      | PromiseSettle(c)             | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 93      | PromiseRegisterCallback(p)   | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 94      | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊥, ⊥, P, A⟩    | 422    |                                                      |
| 95      | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊥, ⊥, P, A⟩    | 422    |                                                      |
| 96      | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊥, ⊥, P::p, A⟩ | 200    |                                                      |
| 97      | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊥, ⊥, P, A⟩    | 200    |                                                      |
| 98      | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊥, a, P, A⟩    | 422    |                                                      |
| 99      | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊥, a, P, A⟩    | 422    |                                                      |
| 100     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊥, a, P::p, A⟩ | 200    |                                                      |
| 101     | PromiseRegisterCallback(p)   | ⟨p, o, ⊥, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊥, a, P, A⟩    | 200    |                                                      |
| 102     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊤, ⊥, P, A⟩    | 422    |                                                      |
| 103     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊤, ⊥, P, A⟩    | 422    |                                                      |
| 104     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊤, ⊥, P::p, A⟩ | 200    |                                                      |
| 105     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, ⊥, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊤, ⊥, P, A⟩    | 200    |                                                      |
| 106     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : ¬Exists(p)                                  | ⟨p, o, ⊤, a, P, A⟩    | 422    |                                                      |
| 107     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨p, o, ⊤, a, P, A⟩    | 422    |                                                      |
| 108     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Pending(p)     | ⟨p, o, ⊤, a, P::p, A⟩ | 200    |                                                      |
| 109     | PromiseRegisterCallback(p)   | ⟨p, o, ⊤, a, P, A⟩ : Exists(p) ∧ HasAddress(p) ∧ Settled(p)     | ⟨p, o, ⊤, a, P, A⟩    | 200    |                                                      |
| 110     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 111     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 112     | PromiseRegisterCallback(p)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 113     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 114     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 115     | PromiseRegisterCallback(p)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 116     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 117     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 118     | PromiseRegisterCallback(p)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 119     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : ¬Exists(p)                                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 120     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ ¬HasAddress(p)                 | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 422    |                                                      |
| 121     | PromiseRegisterCallback(p)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ : Exists(p) ∧ HasAddress(p)                  | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 122     | PromiseRegisterListener(a)   | ⊥                                                                 | ⊥                      | 404    |                                                      |
| 123     | PromiseRegisterListener(a)   | ⟨p, o, ⊥, ⊥, P, A⟩                                               | ⟨p, o, ⊥, ⊥, P, A::a⟩ | 200    |                                                      |
| 124     | PromiseRegisterListener(a)   | ⟨p, o, ⊥, a, P, A⟩                                               | ⟨p, o, ⊥, a, P, A::a⟩ | 200    |                                                      |
| 125     | PromiseRegisterListener(a)   | ⟨p, o, ⊤, ⊥, P, A⟩                                               | ⟨p, o, ⊤, ⊥, P, A::a⟩ | 200    |                                                      |
| 126     | PromiseRegisterListener(a)   | ⟨p, o, ⊤, a, P, A⟩                                               | ⟨p, o, ⊤, a, P, A::a⟩ | 200    |                                                      |
| 127     | PromiseRegisterListener(a)   | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 128     | PromiseRegisterListener(a)   | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 129     | PromiseRegisterListener(a)   | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| 130     | PromiseRegisterListener(a)   | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    | 200    |                                                      |
| ~~131~~ | ~~Tick(t)~~                  | ~~⊥~~                                                             | ~~⊥~~                  |        |                                                      |
| 132     | Tick(t)                      | ⟨p, o, ⊥, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊥, ⊥, P, A⟩    |        |                                                      |
| 133     | Tick(t)                      | ⟨p, o, ⊥, ⊥, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 134     | Tick(t)                      | ⟨p, o, ⊥, a, P, A⟩ : t < o                                       | ⟨p, o, ⊥, a, P, A⟩    |        |                                                      |
| 135     | Tick(t)                      | ⟨p, o, ⊥, a, P, A⟩ : t ≥ o                                       | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 136     | Tick(t)                      | ⟨p, o, ⊤, ⊥, P, A⟩ : t < o                                       | ⟨p, o, ⊤, ⊥, P, A⟩    |        |                                                      |
| 137     | Tick(t)                      | ⟨p, o, ⊤, ⊥, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A                |
| 138     | Tick(t)                      | ⟨p, o, ⊤, a, P, A⟩ : t < o                                       | ⟨p, o, ⊤, a, P, A⟩    |        |                                                      |
| 139     | Tick(t)                      | ⟨p, o, ⊤, a, P, A⟩ : t ≥ o                                       | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        | EnqueueSettle, EnqueueResume ∀p∈P, Send(Unblock) ∀a∈A |
| 140     | Tick(t)                      | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 141     | Tick(t)                      | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 142     | Tick(t)                      | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
| 143     | Tick(t)                      | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩                                               | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩    |        |                                                      |
