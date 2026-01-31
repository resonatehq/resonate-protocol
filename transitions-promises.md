# Promise State Transitions

## States

| Symbol | Description |
|--------|-------------|
| ⊥ | Promise does not exist |
| ⟨p, o, ⊥, ⊥, ∅, S⟩ | Pending |
| ⟨p, o, ⊥, a, C, S⟩ | Pending with target address |
| ⟨p, o, ⊤, ⊥, ∅, S⟩ | Pending (timer) |
| ⟨p, o, ⊤, a, C, S⟩ | Pending (timer) with target address |
| ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | Resolved |
| ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected |
| ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (canceled) |
| ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | Rejected (timedout) |

## Symbols

| Symbol | Description |
|--------|-------------|
| ⊤ | True |
| ⊥ | False |
| t | Current time |
| o | Timeout time |
| a | Target address |
| C | Set of callbacks |
| S | Set of subscriptions |

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

| Side Effect | Description |
|-------------|-------------|
| EnqueueInvoke | Enqueue invoke |
| EnqueueResume | Enqueue resume |
| EnqueueSettle | Enqueue settle |
| Send(Notify) | Send notify |

## Transitions

| Operation | Current State | Next State | Result | Side Effect(s) |
|-----------|---------------|------------|--------|----------------|
| PromiseGet() | ⊥ | ⊥ | 404 | |
| PromiseGet() | ⟨p, o, ⊥, ⊥, ∅, S⟩ | ⟨p, o, ⊥, ⊥, ∅, S⟩ | 200 | |
| PromiseGet() | ⟨p, o, ⊥, a, C, S⟩ | ⟨p, o, ⊥, a, C, S⟩ | 200 | |
| PromiseGet() | ⟨p, o, ⊤, ⊥, ∅, S⟩ | ⟨p, o, ⊤, ⊥, ∅, S⟩ | 200 | |
| PromiseGet() | ⟨p, o, ⊤, a, C, S⟩ | ⟨p, o, ⊤, a, C, S⟩ | 200 | |
| PromiseGet() | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseGet() | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseGet() | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseGet() | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⊥ : t < o | ⟨p, o, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⊥ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, ⊥) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⊥ : t < o | ⟨p, o, ⊤, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⊥ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, ⊥) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⊥ : t < o | ⟨p, o, ⊥, a, ∅, ∅⟩ | 200 | EnqueueInvoke |
| PromiseCreate(t, o, ⊥, a) | ⊥ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊥, a) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊥, a) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⊥ : t < o | ⟨p, o, ⊤, a, ∅, ∅⟩ | 200 | EnqueueInvoke |
| PromiseCreate(t, o, ⊤, a) | ⊥ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊥, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨p, o, ⊥, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨p, o, ⊤, ⊥, ∅, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨p, o, ⊤, a, C, S⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseCreate(t, o, ⊤, a) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseCreate(t, o, ⊤, a) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, r) | ⊥ | ⊥ | 404 | |
| PromiseSettle(t, r) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, r) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, r) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, r) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, r) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, x) | ⊥ | ⊥ | 404 | |
| PromiseSettle(t, x) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, x) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, x) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, x) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, x) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, c) | ⊥ | ⊥ | 404 | |
| PromiseSettle(t, c) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊥, ⊥, ∅, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊥, a, C, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊥, a, C, S⟩ : t ≥ o | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊤, ⊥, ∅, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊤, a, C, S⟩ : t < o | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨p, o, ⊤, a, C, S⟩ : t ≥ o | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | EnqueueSettle, EnqueueResume ∀c∈C, Send(Notify) ∀s∈S |
| PromiseSettle(t, c) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, c) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, c) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSettle(t, c) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseRegister(c) | ⊥ | ⊥ | 404 | |
| PromiseRegister(c) | ⟨p, o, ⊥, ⊥, ∅, S⟩ | ⟨p, o, ⊥, ⊥, ∅, S⟩ | 200 | |
| PromiseRegister(c) | ⟨p, o, ⊥, a, C, S⟩ | ⟨p, o, ⊥, a, C::c, S⟩ | 200 | |
| PromiseRegister(c) | ⟨p, o, ⊤, ⊥, ∅, S⟩ | ⟨p, o, ⊤, ⊥, ∅, S⟩ | 200 | |
| PromiseRegister(c) | ⟨p, o, ⊤, a, C, S⟩ | ⟨p, o, ⊤, a, C::c, S⟩ | 200 | |
| PromiseRegister(c) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseRegister(c) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseRegister(c) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseRegister(c) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSubscribe(s) | ⊥ | ⊥ | 404 | |
| PromiseSubscribe(s) | ⟨p, o, ⊥, ⊥, ∅, S⟩ | ⟨p, o, ⊥, ⊥, ∅, S::s⟩ | 200 | |
| PromiseSubscribe(s) | ⟨p, o, ⊥, a, C, S⟩ | ⟨p, o, ⊥, a, C, S::s⟩ | 200 | |
| PromiseSubscribe(s) | ⟨p, o, ⊤, ⊥, ∅, S⟩ | ⟨p, o, ⊤, ⊥, ∅, S::s⟩ | 200 | |
| PromiseSubscribe(s) | ⟨p, o, ⊤, a, C, S⟩ | ⟨p, o, ⊤, a, C, S::s⟩ | 200 | |
| PromiseSubscribe(s) | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨r, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSubscribe(s) | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨x, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSubscribe(s) | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨c, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
| PromiseSubscribe(s) | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | ⟨t, ⊥, ⊥, ⊥, ∅, ∅⟩ | 200 | |
