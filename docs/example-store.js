// The server's promise store, which starts empty. Each delta is what the step
// at that number writes; the panel shows the whole store as it stands after
// the step, with the touched row marked.
const DELTAS = {
  2: { id: "foo.1", state: "pending" },
  4: { id: "foo.1", listeners: ["client.example.org"] },
  11: { id: "foo.1:1", state: "pending" },
  15: { id: "foo.1:1", callbacks: ["foo.1"] },
  22: { id: "foo.1:1", state: "resolved", value: "10" },
  33: { id: "foo.1", state: "resolved", value: "10" },
  34: { id: "foo.1", listeners: [] },
};

// Steps worth calling out precisely because they write nothing.
const NOTES = {
  23: "Unchanged. Settling foo.1:1 fired the callback registered at step 15, and that is what put foo.1 back on a worker.",
  29: "Unchanged. The create is idempotent on the id, so the replay reads the promise it made on the first pass rather than adding a second one.",
  34: "The value was already durable at step 33; what changes here is the listener, which the server consumes as it sends.",
};

const STEPS_TOTAL = 34;

export const STORE = (() => {
  const out = {};
  const rows = new Map();
  for (let n = 1; n <= STEPS_TOTAL; n++) {
    const d = DELTAS[n];
    if (d) {
      const row = rows.get(d.id) || { id: d.id, state: "pending", callbacks: [], listeners: [] };
      if (d.state) row.state = d.state;
      if (d.value !== undefined) row.value = d.value;
      if (d.callbacks) row.callbacks = [...row.callbacks, ...d.callbacks];
      if (d.listeners) row.listeners = d.listeners.length ? [...row.listeners, ...d.listeners] : [];
      rows.set(d.id, row);
    }
    out[n] = {
      rows: [...rows.values()].map((r) => ({ ...r, changed: !!d && d.id === r.id })),
      note: NOTES[n],
    };
  }
  return out;
})();
