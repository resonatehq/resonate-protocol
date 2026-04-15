# Schedule State Transitions

## States

| Symbol        | Description              |
| ------------- | ------------------------ |
| ⊥             | Schedule does not exist  |
| ⟨c, n, ⊥⟩    | Exists, never run        |
| ⟨c, n, l⟩    | Exists, last run at `l`  |

## Symbols

| Symbol | Description                                     |
| ------ | ----------------------------------------------- |
| t      | Current time                                    |
| c      | Cron expression; `c(t)` gives next time after t |
| n      | Next run time                                   |
| l      | Last run time                                   |

## Operations

```
ScheduleGet()
ScheduleCreate(t, c)
ScheduleDelete()
Tick(t)
```

## Side Effects

| Side Effect   | Description      |
| ------------- | ---------------- |
| PromiseCreate | Create a promise |

## Transitions

| #  | Operation            | Current State     | Next State    | Result | Side Effect(s) |
| -- | -------------------- | ----------------- | ------------- | ------ | -------------- |
| 1  | ScheduleGet()        | ⊥                 | ⊥             | 404    |                |
| 2  | ScheduleGet()        | ⟨c, n, ⊥⟩         | ⟨c, n, ⊥⟩     | 200    |                |
| 3  | ScheduleGet()        | ⟨c, n, l⟩         | ⟨c, n, l⟩     | 200    |                |
| 4  | ScheduleCreate(t, c) | ⊥                 | ⟨c, c(t), ⊥⟩  | 200    |                |
| 5  | ScheduleCreate(t, c) | ⟨c, n, ⊥⟩         | ⟨c, n, ⊥⟩     | 200    |                |
| 6  | ScheduleCreate(t, c) | ⟨c, n, l⟩         | ⟨c, n, l⟩     | 200    |                |
| 7  | ScheduleDelete()     | ⊥                 | ⊥             | 404    |                |
| 8  | ScheduleDelete()     | ⟨c, n, ⊥⟩         | ⊥             | 200    |                |
| 9  | ScheduleDelete()     | ⟨c, n, l⟩         | ⊥             | 200    |                |
| 10 | Tick(t)              | ⊥                 | ⊥             |        |                |
| 11 | Tick(t)              | ⟨c, n, ⊥⟩ : t < n | ⟨c, n, ⊥⟩     |        |                |
| 12 | Tick(t)              | ⟨c, n, ⊥⟩ : t ≥ n | ⟨c, c(t), t⟩  |        | PromiseCreate  |
| 13 | Tick(t)              | ⟨c, n, l⟩ : t < n | ⟨c, n, l⟩     |        |                |
| 14 | Tick(t)              | ⟨c, n, l⟩ : t ≥ n | ⟨c, c(t), t⟩  |        | PromiseCreate  |
