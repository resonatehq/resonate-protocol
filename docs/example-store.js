// The server's state, which starts empty: promises as a tree, and beside each
// one the task that advances it. Task id is promise id, so they share a row
// group rather than being listed apart.
//
// Task transitions follow spec/transitions-tasks.md: a task is created pending
// at version 0, TaskAcquire(t, l, v) on a pending task at v moves it to
// acquired at v+1, suspend parks it, and fulfil closes it.
const DELTAS = {
  2: {
    promise: { id: "foo.1", state: "pending" },
    task: { state: "pending", version: 0 },
  },
  4: { promise: { id: "foo.1", listeners: ["client.example.org"] } },
  7: { task: { id: "foo.1", state: "acquired", version: 1, pid: "worker-a" } },
  11: {
    promise: { id: "foo.1:1", parent: "foo.1", state: "pending" },
    task: { state: "pending", version: 0 },
  },
  15: {
    promise: { id: "foo.1:1", callbacks: ["foo.1"] },
    task: { id: "foo.1", state: "suspended", pid: null },
  },
  18: { task: { id: "foo.1:1", state: "acquired", version: 1, pid: "worker-b" } },
  22: {
    promise: { id: "foo.1:1", state: "resolved", value: "10" },
    task: { id: "foo.1:1", state: "fulfilled", pid: null },
  },
  // settling foo.1:1 fires its callback: the callback is consumed, and the
  // parent's task goes back to pending, which is what the dispatch below is
  23: {
    promise: { id: "foo.1:1", callbacks: [] },
    task: { id: "foo.1", state: "pending" },
  },
  25: { task: { id: "foo.1", state: "acquired", version: 2, pid: "worker-b" } },
  33: {
    promise: { id: "foo.1", state: "resolved", value: "10" },
    task: { id: "foo.1", state: "fulfilled", pid: null },
  },
  34: { promise: { id: "foo.1", listeners: [] } },
};

// Steps worth calling out precisely because they write nothing.
const NOTES = {
  29: "Unchanged. The create is idempotent on the id, so the replay reads the promise it made on the first pass rather than adding a second one.",
  31: "Unchanged. The program is running; nothing it has done yet has reached the server.",
};

const STEPS_TOTAL = 34;

export const STORE = (() => {
  const out = {};
  const rows = new Map();

  const touch = (id, parent) => {
    if (!rows.has(id)) {
      rows.set(id, { id, parent, state: "pending", callbacks: [], listeners: [], task: null });
    }
    return rows.get(id);
  };

  for (let n = 1; n <= STEPS_TOTAL; n++) {
    const d = DELTAS[n];
    let touchedId = null;

    if (d?.promise) {
      const p = d.promise;
      const row = touch(p.id, p.parent);
      if (p.state) row.state = p.state;
      if (p.value !== undefined) row.value = p.value;
      if (p.callbacks) row.callbacks = p.callbacks.length ? [...row.callbacks, ...p.callbacks] : [];
      if (p.listeners) row.listeners = p.listeners.length ? [...row.listeners, ...p.listeners] : [];
      touchedId = p.id;
    }
    if (d?.task) {
      const t = d.task;
      const id = t.id ?? d.promise?.id;
      const row = touch(id);
      row.task = { ...(row.task ?? {}), ...t };
      if (t.pid === null) row.task.pid = undefined;
      touchedId = id;
    }

    // parents first, each child directly under its parent
    const ordered = [];
    for (const row of rows.values()) if (!row.parent) ordered.push({ ...row, depth: 0 });
    for (const row of rows.values()) {
      if (!row.parent) continue;
      const at = ordered.findIndex((r) => r.id === row.parent);
      ordered.splice(at < 0 ? ordered.length : at + 1, 0, { ...row, depth: 1 });
    }

    out[n] = {
      rows: ordered.map((r) => ({ ...r, changed: r.id === touchedId })),
      note: NOTES[n],
    };
  }
  return out;
})();
