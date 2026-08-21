// The server's promise store, which starts empty. Each delta is what the step
// at that number writes; the panel shows the whole store as it stands after
// the step, with the touched row marked.
const DELTAS = {
  2: { id: "foo.1", state: "pending" },
  9: { id: "foo.1:1", state: "pending" },
  13: { id: "foo.1:1", callbacks: ["foo.1"] },
  20: { id: "foo.1:1", state: "resolved", value: "10" },
  31: { id: "foo.1", state: "resolved", value: "10" },
};

// Steps worth calling out precisely because they write nothing.
const NOTES = {
  27: "Unchanged. The create is idempotent on the id, so the replay reads the promise it made on the first pass rather than adding a second one.",
  21: "Unchanged. Settling foo.1:1 fired the callback registered at step 13, and that is what put foo.1 back on a worker.",
  32: "Unchanged. The value was already durable at step 31; this step only carries it to the listener.",
};

const STEPS_TOTAL = 32;

export const STORE = (() => {
  const out = {};
  const rows = new Map();
  for (let n = 1; n <= STEPS_TOTAL; n++) {
    const d = DELTAS[n];
    if (d) {
      const row = rows.get(d.id) || { id: d.id, state: "pending", callbacks: [] };
      if (d.state) row.state = d.state;
      if (d.value !== undefined) row.value = d.value;
      if (d.callbacks) row.callbacks = [...row.callbacks, ...d.callbacks];
      rows.set(d.id, row);
    }
    out[n] = {
      rows: [...rows.values()].map((r) => ({ ...r, changed: !!d && d.id === r.id })),
      note: NOTES[n],
    };
  }
  return out;
})();
