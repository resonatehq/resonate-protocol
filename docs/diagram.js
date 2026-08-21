// Shared machinery for the sequence-diagram pages: render, even out the
// lifelines, and make every message clickable. Each page supplies its own
// mermaid source and its own step copy; the behaviour lives here so the two
// pages cannot drift apart.

const SVGNS = "http://www.w3.org/2000/svg";

export function mermaidConfig(sequence = {}) {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return {
    startOnLoad: false,
    theme: dark ? "dark" : "default",
    securityLevel: "loose",
    sequence: {
      useMaxWidth: false,
      wrap: true,
      width: 150, // every participant box the same width
      actorMargin: 170,
      messageFontSize: 13,
      noteFontSize: 13,
      ...sequence,
    },
  };
}

// Mermaid widens individual gaps to fit the longest message on that pair, so
// lifelines end up unevenly spaced. Re-map every x coordinate through a
// piecewise-linear function that stretches each gap to the widest one: the
// lifelines land on an even pitch and nothing can overflow, since every
// interval only grows.
export function equalizeLifelines(svg) {
  const centers = [
    ...new Set([...svg.querySelectorAll("rect.actor")].map((r) => +r.getAttribute("x") + +r.getAttribute("width") / 2)),
  ].sort((a, b) => a - b);
  if (centers.length < 2) return;

  const gaps = centers.slice(1).map((v, i) => v - centers[i]);
  const pitch = Math.max(...gaps);
  if (pitch - Math.min(...gaps) < 0.5) return;

  const last = centers.length - 1;
  const target = (i) => centers[0] + i * pitch;
  const shift = target(last) - centers[last];

  const f = (x) => {
    if (x <= centers[0]) return x;
    if (x >= centers[last]) return x + shift;
    let i = 0;
    while (i < last - 1 && x > centers[i + 1]) i++;
    const t = (x - centers[i]) / (centers[i + 1] - centers[i]);
    return target(i) + t * pitch;
  };

  const live = (sel) => [...svg.querySelectorAll(sel)].filter((e) => !e.closest("defs"));

  live("line").forEach((e) => {
    e.setAttribute("x1", f(+e.getAttribute("x1")));
    e.setAttribute("x2", f(+e.getAttribute("x2")));
  });
  live("rect").forEach((e) => {
    // boxes move with their centre, keeping their size
    const x = +e.getAttribute("x"),
      w = +e.getAttribute("width");
    e.setAttribute("x", f(x + w / 2) - w / 2);
  });
  live("text").forEach((e) => {
    if (e.hasAttribute("x")) e.setAttribute("x", f(+e.getAttribute("x")));
    e.querySelectorAll("tspan[x]").forEach((t) => {
      t.setAttribute("x", f(+t.getAttribute("x")));
    });
  });
  live("polygon").forEach((e) => {
    // loop/alt label tabs: move, don't stretch
    const pts = e
      .getAttribute("points")
      .trim()
      .split(/\s+/)
      .map((p) => p.split(",").map(Number));
    const minX = Math.min(...pts.map((p) => p[0]));
    const d = f(minX) - minX;
    e.setAttribute("points", pts.map(([x, y]) => `${x + d},${y}`).join(" "));
  });

  const width = +svg.getAttribute("width") + shift;
  svg.setAttribute("width", width);
  const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  if (vb.length === 4) svg.setAttribute("viewBox", `${vb[0]} ${vb[1]} ${width} ${vb[3]}`);
}

// Mermaid gives each message row only as much height as its own label needs, so
// the rows drum out an irregular rhythm. Shift each row down onto an even
// pitch — the widest gap, so no label can collide — translating each row's
// label with its arrow rather than stretching the interval, which would pull
// the lines of a multi-line label apart.
export function equalizeMessageRows(svg) {
  const lines = [...svg.querySelectorAll('line[class*="messageLine"]')];
  if (lines.length < 2) return;

  const anchors = lines.map((l) => +l.getAttribute("y1"));
  const pitch = Math.max(...anchors.slice(1).map((y, i) => y - anchors[i]));
  const delta = anchors.map((y, i) => anchors[0] + i * pitch - y);
  if (delta[delta.length - 1] < 0.5) return;

  // Everything above a row's arrow, down to the arrow above it, moves with it —
  // with a little slack below the arrow itself, since the autonumber sits just
  // under the line and belongs to that row, not to the next one.
  const g = (y) => {
    for (let i = 0; i < anchors.length; i++) if (y <= anchors[i] + 8) return y + delta[i];
    return y + delta[delta.length - 1];
  };

  const live = (sel) => [...svg.querySelectorAll(sel)].filter((e) => !e.closest("defs"));

  live("line").forEach((e) => {
    e.setAttribute("y1", g(+e.getAttribute("y1")));
    e.setAttribute("y2", g(+e.getAttribute("y2")));
  });
  live("rect").forEach((e) => {
    // actor boxes and notes keep their height
    const y = +e.getAttribute("y"),
      h = +e.getAttribute("height");
    e.setAttribute("y", g(y + h / 2) - h / 2);
  });
  live("text").forEach((e) => {
    e.setAttribute("y", g(+e.getAttribute("y")));
  });
  live("circle").forEach((e) => {
    e.setAttribute("cy", g(+e.getAttribute("cy")));
  });
  live("polygon").forEach((e) => {
    const pts = e
      .getAttribute("points")
      .trim()
      .split(/\s+/)
      .map((p) => p.split(",").map(Number));
    const minY = Math.min(...pts.map((p) => p[1]));
    const d = g(minY) - minY;
    e.setAttribute("points", pts.map(([x, y]) => `${x},${y + d}`).join(" "));
  });

  const height = +svg.getAttribute("height") + delta[delta.length - 1];
  svg.setAttribute("height", height);
  const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  if (vb.length === 4) svg.setAttribute("viewBox", `${vb[0]} ${vb[1]} ${vb[2]} ${height}`);
}

// Mermaid emits one <line> per message in source order, and the label text
// sits just above its line. That is enough to rebuild the message list and
// give each one a full-width click band.
function buildMessages(svg) {
  const lines = [...svg.querySelectorAll('line[class*="messageLine"]')];
  const labels = [...svg.querySelectorAll("text.messageText")];

  const bands = lines.map((line, i) => {
    const y = +line.getAttribute("y1");
    const prevY = i ? +lines[i - 1].getAttribute("y1") : -Infinity;
    const texts = labels.filter((t) => +t.getAttribute("y") <= y && +t.getAttribute("y") > prevY);
    const [x1, x2] = [+line.getAttribute("x1"), +line.getAttribute("x2")];
    return {
      n: i + 1,
      line,
      texts,
      y,
      top: texts.length ? Math.min(...texts.map((t) => +t.getAttribute("y"))) - 14 : y - 18,
      bottom: y + 8,
      label: texts.map((t) => t.textContent).join("\n"),
      dashed: line.getAttribute("class").includes("messageLine1"),
      x1,
      x2,
    };
  });

  // A tall multi-line label can reach back past the previous arrow; keep the
  // click bands disjoint so every message owns its own strip.
  bands.forEach((b, i) => {
    if (i + 1 < bands.length) b.bottom = Math.min(b.bottom, bands[i + 1].top);
  });
  return bands;
}

const actorName = (svg, x) => {
  let best = null,
    bestD = Infinity;
  for (const r of svg.querySelectorAll("rect.actor")) {
    const d = Math.abs(+r.getAttribute("x") + +r.getAttribute("width") / 2 - x);
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  const label = best?.parentNode.querySelector("text");
  return label ? label.textContent.trim() : "?";
};

// name -> lifeline x, for placing decorations that span named participants
const actorCenters = (svg) => {
  const out = {};
  for (const r of svg.querySelectorAll("rect.actor")) {
    const label = r.parentNode.querySelector("text");
    if (label) out[label.textContent.trim()] = +r.getAttribute("x") + +r.getAttribute("width") / 2;
  }
  return out;
};

// The participants' own extent: the outer edges of the first and last box.
// Bands and the outer frame stop here rather than at the drawing's edge.
const actorBounds = (svg) => {
  const boxes = [...svg.querySelectorAll("rect.actor")];
  const width = boxes.length ? +boxes[0].getAttribute("width") : 150;
  const xs = boxes.map((r) => +r.getAttribute("x"));
  return { left: Math.min(...xs), right: Math.max(...xs) + width, width };
};

// param.data and value.data travel base64; show what they decode to, so the
// message stays honest without becoming unreadable.
const decodePayloads = (json, path = "", out = []) => {
  if (json && typeof json === "object") {
    for (const [k, v] of Object.entries(json)) {
      const here = path ? `${path}.${k}` : k;
      if ((k === "param" || k === "value") && v && typeof v.data === "string") {
        try {
          out.push([`${here}.data`, atob(v.data)]);
        } catch {
          /* not base64 */
        }
      } else decodePayloads(v, here, out);
    }
  }
  return out;
};

const wireBlock = (json) => {
  let decoded = [];
  try {
    decoded = decodePayloads(JSON.parse(json));
  } catch {
    /* shown as-is */
  }
  const seen = new Map(decoded); // one line per distinct payload
  return (
    `<div class="wire"><span class="wire-head">on the wire</span><pre>${esc(json)}</pre>` +
    (seen.size
      ? `<ul class="decoded">${[...seen]
          .map(([p, v]) => `<li><span>${esc(p)}</span> decodes to <code>${esc(v)}</code></li>`)
          .join("")}</ul>`
      : "") +
    `</div>`
  );
};

// The spec handler that processes a message, with the arm this message takes
// highlighted. Sources are quoted from the Lean abstract model in example-lean.js.
const SPEC_TYPES = "https://github.com/resonatehq/resonate-protocol/blob/main/spec/types-raw.ts";
const SPEC_BASE = "https://github.com/resonatehq/resonate-specification/blob/main/spec/02-abstract";

const typesBlock = (types) =>
  `<div class="wire types"><span class="wire-head">message schema · <a href="${SPEC_TYPES}" target="_blank" rel="noreferrer">types-raw.ts</a></span>` +
  types.map((t) => `<pre>${esc(t)}</pre>`).join("") +
  `</div>`;

const leanBlock = (lean) => {
  const lines = lean.src.split("\n");
  const at = lines.findIndex((l) => l.trim().startsWith(lean.arm));
  const indent = at < 0 ? 0 : lines[at].search(/\S/);
  let end = at;
  if (!lean.only) {
    while (end + 1 < lines.length) {
      const next = lines[end + 1];
      if (next.trim() && next.search(/\S/) <= indent) break;
      end++;
    }
  }
  const body = lines
    .map((l, i) => `<span class="l${at >= 0 && i >= at && i <= end ? " on" : ""}">${esc(l) || " "}</span>`)
    .join("");
  return `<div class="lean"><span class="lean-head">handler · <a href="${SPEC_BASE}/${lean.file}.lean" target="_blank" rel="noreferrer">${lean.file}.lean</a></span><pre>${body}</pre></div>`;
};

// The server's promise store as it stands after a step, touched row marked.
const storeBlock = (st) =>
  `<div class="store"><span class="store-head">promise store</span>` +
  (st.rows.length
    ? `<table>${st.rows
        .map(
          (r) => `<tr class="${r.changed ? "changed" : ""}">
         <td class="id">${esc(r.id)}</td>
         <td class="state">${esc(r.state)}${r.value !== undefined ? ` = ${esc(r.value)}` : ""}</td>
         <td class="cb">${[
           r.callbacks.length ? `wakes ${r.callbacks.map(esc).join(", ")}` : "",
           r.listeners?.length ? `notifies ${r.listeners.map(esc).join(", ")}` : "",
         ]
           .filter(Boolean)
           .join(" · ")}</td>
       </tr>`,
        )
        .join("")}</table>`
    : `<p class="empty">empty</p>`) +
  (st.note ? `<p class="store-note">${st.note}</p>` : "") +
  `</div>`;

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

// halfway to the neighbouring row (or half a row past the end of the run)
const mid = (msgs, i, dir) => {
  const here = msgs[i].y,
    next = msgs[i + dir];
  if (next) return (here + next.y) / 2;
  const other = msgs[i - dir];
  return other ? here + (dir * Math.abs(here - other.y)) / 2 : here + dir * 20;
};

// A grey underlay behind a run of messages: one activation, the stretch where a
// worker holds the task and a program instance is alive inside the SDK.
function drawActivations(svg, msgs, specs) {
  if (!specs || !specs.length) return;
  const centers = actorCenters(svg);
  const bounds = actorBounds(svg);
  const layer = document.createElementNS(SVGNS, "g");
  layer.setAttribute("class", "activations");

  for (const a of specs) {
    const [first, last] = [msgs[a.from - 1], msgs[a.to - 1]];
    if (!first || !last) continue;
    const [x1, x2] = [centers[a.left], centers[a.right]];
    if (!a.full && (x1 == null || x2 == null)) continue;

    // full: edge to edge of the diagram; otherwise just the participants named
    const x = a.full ? bounds.left : Math.min(x1, x2) - 34;
    const width = a.full ? bounds.right - bounds.left : Math.abs(x2 - x1) + 68;

    // bands break halfway between rows, so a band's edge never crowds an arrow
    const top = mid(msgs, a.from - 1, -1);
    const rect = document.createElementNS(SVGNS, "rect");
    rect.setAttribute("class", a.tone ? `activation ${a.tone}` : "activation");
    rect.setAttribute("x", x);
    rect.setAttribute("y", top);
    rect.setAttribute("width", width);
    rect.setAttribute("height", mid(msgs, a.to - 1, +1) - top);
    rect.setAttribute("rx", 6);
    layer.appendChild(rect);
  }
  svg.insertBefore(layer, svg.firstChild); // underlay: everything else draws on top
}

// Mermaid sizes a loop frame with its own padding, so it sits at a different
// rhythm than the bands. Snap it to the same row boundaries: the frame opens
// halfway between the message above it and the first message it encloses, and
// closes halfway after the last — landing flush with a band edge.
function snapLoopFrames(svg, msgs) {
  const lines = [...svg.querySelectorAll("line.loopLine")];
  const bounds = actorBounds(svg);
  const frames = [];

  for (let i = 0; i + 3 < lines.length; i += 4) {
    const group = lines.slice(i, i + 4);
    const ys = group.flatMap((l) => [+l.getAttribute("y1"), +l.getAttribute("y2")]);
    const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
    const inside = msgs.filter((m) => m.y > top + 0.5 && m.y < bottom - 0.5);
    if (!inside.length) continue;

    const xs = group.flatMap((l) => [+l.getAttribute("x1"), +l.getAttribute("x2")]);
    // snap to the lifelines themselves — message endpoints sit a few px off centre
    const centres = Object.values(actorCenters(svg));
    const nearest = (x) => centres.reduce((a, c) => (Math.abs(c - x) < Math.abs(a - x) ? c : a), centres[0]);
    const reach = inside.flatMap((m) => [nearest(m.x1), nearest(m.x2)]);
    frames.push({
      group,
      top,
      bottom,
      left: Math.min(...xs),
      right: Math.max(...xs),
      // a nested frame stops a quarter-box outside the lifelines it spans —
      // halfway from each end lifeline to that participant's box edge
      inner: [Math.min(...reach) - bounds.width / 4, Math.max(...reach) + bounds.width / 4],
      newTop: mid(msgs, msgs.indexOf(inside[0]), -1),
      newBottom: mid(msgs, msgs.indexOf(inside[inside.length - 1]), +1),
      // the "loop" tab is dropped; the caption moves to the closing edge
      tab: [...svg.querySelectorAll("polygon.labelBox")]
        .filter(
          (e) =>
            Math.abs(
              Math.min(
                ...e
                  .getAttribute("points")
                  .trim()
                  .split(/\s+/)
                  .map((pt) => +pt.split(",")[1]),
              ) - top,
            ) < 1,
        )
        .concat(
          [...svg.querySelectorAll("text.labelText")].filter(
            (e) => +e.getAttribute("y") > top && +e.getAttribute("y") < top + 40,
          ),
        ),
      caption: [...svg.querySelectorAll("text.loopText")].find(
        (e) => +e.getAttribute("y") > top && +e.getAttribute("y") < top + 40,
      ),
    });
  }

  for (const f of frames) {
    // A frame with another frame inside it runs edge to edge, like the bands;
    // everything else keeps mermaid's inset, so the nesting stays legible.
    const encloses = frames.some((o) => o !== f && o.top > f.top && o.bottom < f.bottom);
    const [left, right] = encloses ? [bounds.left, bounds.right] : f.inner;

    const snap = (y) => (Math.abs(y - f.top) < 1 ? f.newTop : f.newBottom);
    const snapX = (x) => (Math.abs(x - f.left) < 1 ? left : right);
    f.group.forEach((l) => {
      l.setAttribute("y1", snap(+l.getAttribute("y1")));
      l.setAttribute("y2", snap(+l.getAttribute("y2")));
      l.setAttribute("x1", snapX(+l.getAttribute("x1")));
      l.setAttribute("x2", snapX(+l.getAttribute("x2")));
    });
    f.group.forEach((l) => {
      l.style.setProperty("stroke-dasharray", "none", "important");
    });
    f.tab.forEach((e) => {
      e.remove();
    });

    // The condition belongs at the closing edge: at the top of a frame you
    // cannot yet know it repeats — you know it when it comes back round.
    const caption = f.caption;
    if (caption?.textContent.trim().replace(/\u200b/g, "")) {
      caption.setAttribute("y", f.newBottom - 7);
      caption.setAttribute("x", (left + right) / 2);
      caption.setAttribute("text-anchor", "middle");
      caption.textContent = caption.textContent.trim().replace(/^\[|\]$/g, "");
      caption.classList.add("loopCaption");
      caption.style.setProperty("font-style", "italic", "important"); // mermaid's own rule is id-scoped
    } else if (caption) {
      caption.remove();
    }
  }
}

function wire(svg, { steps, panel, hint, code, activations, emphasize }) {
  const msgs = buildMessages(svg);
  drawActivations(svg, msgs, activations);
  snapLoopFrames(svg, msgs);

  // a few messages carry more weight than the rest — set inline, since
  // mermaid's own text rule is id-scoped and beats a class selector
  const bold = new Set();
  for (const n of emphasize || []) {
    for (const t of (msgs[n - 1] || { texts: [] }).texts) {
      t.style.setProperty("font-weight", "700", "important");
      bold.add(t);
    }
  }

  // Mermaid's own rules are id-scoped, so a class selector loses to them. Paint
  // the selected message inline instead, and leave an emphasized label's weight
  // alone rather than overwriting it with the lighter selected weight.
  const paint = (m, on) => {
    const set = (el, prop, val) => (on ? el.style.setProperty(prop, val, "important") : el.style.removeProperty(prop));
    set(m.line, "stroke", "var(--accent)");
    set(m.line, "stroke-width", "2.4");
    m.texts.forEach((t) => {
      set(t, "fill", "var(--accent)");
      if (!bold.has(t)) set(t, "font-weight", "600");
    });
  };
  const vb = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  const [vx, vw] = vb.length === 4 ? [vb[0], vb[2]] : [0, +svg.getAttribute("width")];

  const band = document.createElementNS(SVGNS, "rect");
  band.setAttribute("class", "sel-band");
  band.setAttribute("rx", 4);
  band.style.display = "none";
  svg.appendChild(band);

  const hits = document.createElementNS(SVGNS, "g");
  svg.appendChild(hits);

  let current = null;

  const markCode = (lines) => {
    if (!code) return;
    code.querySelectorAll(".ln").forEach((el) => {
      const n = +el.dataset.n;
      el.classList.toggle("on", !!lines && n >= lines[0] && n <= (lines[1] ?? lines[0]));
    });
    code.classList.toggle("has-selection", !!lines);
  };

  const render = (m) => {
    if (!m) {
      panel.innerHTML = hint;
      return;
    }
    const s = steps[m.n] || { title: `Step ${m.n}`, body: "" };
    const a = actorName(svg, m.x1),
      b = actorName(svg, m.x2);
    panel.innerHTML = `
      <div class="step">Step ${m.n} of ${msgs.length}</div>
      <h2>${s.title}</h2>
      <p class="route"><b>${a}</b> ${m.dashed ? "⇠ reply ⇢" : "→"} <b>${b}</b></p>
      <p class="label">${esc(s.wire || m.label)}</p>
      <div class="body">${s.body}</div>
      ${s.store ? storeBlock(s.store) : ""}
      ${s.lean ? leanBlock(s.lean) : ""}
      ${s.types ? typesBlock(s.types) : ""}
      ${
        s.json
          ? wireBlock(s.json)
          : s.offWire
            ? `<p class="offwire">Not a wire message — this one crosses the SDK boundary, not the network.</p>`
            : ""
      }
      <div class="nav">
        <button type="button" data-go="-1">← prev</button>
        <button type="button" data-go="1">next →</button>
        <button type="button" data-close>close</button>
        <span class="keys">↑ ↓ · esc</span>
      </div>`;
    // long handlers scroll; bring the highlighted arm into view rather than
    // leaving the reader at the top of the block to hunt for it
    const armRow = panel.querySelector(".lean .l.on");
    if (armRow) {
      const box = armRow.closest("pre");
      const gap = armRow.getBoundingClientRect().top - box.getBoundingClientRect().top;
      box.scrollTop += gap - box.clientHeight / 3;
    }

    panel.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => select(m.n - 1 + +btn.dataset.go));
    });
    panel.querySelector("[data-close]").addEventListener("click", () => select(null));
  };

  const select = (idx) => {
    if (idx != null && (idx < 0 || idx >= msgs.length)) return;
    msgs.forEach((m) => {
      paint(m, false);
      m.line.classList.remove("dim");
      m.texts.forEach((t) => {
        t.classList.remove("dim");
      });
    });
    current = idx == null ? null : msgs[idx];
    svg.classList.toggle("has-selection", !!current);
    panel.classList.toggle("is-open", !!current); // narrow layout: slide the sheet in

    if (!current) {
      band.style.display = "none";
      markCode(null);
      render(null);
      return;
    }

    msgs.forEach((m) => {
      if (m === current) paint(m, true);
      else {
        m.line.classList.add("dim");
        m.texts.forEach((t) => {
          t.classList.add("dim");
        });
      }
    });
    band.setAttribute("x", vx + 2);
    band.setAttribute("width", vw - 4);
    band.setAttribute("y", current.top);
    band.setAttribute("height", current.bottom - current.top);
    band.style.display = "";
    markCode(steps[current.n]?.lines || null);
    render(current);
  };

  msgs.forEach((m, i) => {
    const r = document.createElementNS(SVGNS, "rect");
    r.setAttribute("class", "hit");
    r.setAttribute("x", vx + 2);
    r.setAttribute("width", vw - 4);
    r.setAttribute("y", m.top);
    r.setAttribute("height", m.bottom - m.top);
    r.setAttribute("tabindex", "0");
    r.setAttribute("role", "button");
    r.setAttribute("aria-label", `Step ${m.n}: ${m.label.replace(/\n/g, ", ")}`);
    r.addEventListener("click", () => select(i));
    r.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(i);
      }
    });
    hits.appendChild(r);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") return select(null);
    const at = current ? current.n - 1 : -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "j") {
      e.preventDefault();
      select(at + 1);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "k") {
      e.preventDefault();
      select(Math.max(0, at - 1));
    }
  });

  render(null);
}

export async function mountDiagram(mermaid, { steps, hint, activations, emphasize }) {
  const panel = document.getElementById("detail");
  const code = document.getElementById("code");
  await mermaid.run({ querySelector: ".mermaid" });
  document.querySelectorAll(".mermaid svg").forEach((svg) => {
    equalizeLifelines(svg);
    equalizeMessageRows(svg);
    wire(svg, { steps, panel, hint, code, activations, emphasize });
  });
}
