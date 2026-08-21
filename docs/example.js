// Step copy for the worked example: foo calls bar, across two workers,
// including the replay pass. `lines` highlights the matching source lines.
export const STEPS = {
  1: {
    wire: `promise.create foo.1\nparam = foo(5)\ntarget = http://worker.example.org`,
    title: "The client asks for foo(5)",
    body: `Nothing is running yet. The client writes down what it wants — the function, the argument,
              and where to deliver the answer — and that record is the durable object the rest of this
              diagram revolves around. The target is yours to pick: it is your application's address,
              not the platform's, and it is where step 34 delivers.
              <span class="note">The id <code>foo.1</code> is chosen here, by the caller. It names this
              execution of <code>foo</code> and nothing else, and every promise the execution goes on to
              create hangs off it: the child in step 9 is <code>foo.1:1</code>.</span>`,
  },
  2: {
    wire: `promise.create res foo.1, pending`,
    title: "Accepted, pending",
    body: `<code>foo</code> exists durably and is <code>pending</code>. The client can disconnect here
              and collect the result later; the work is no longer tied to this connection.`,
  },
  3: {
    wire: `promise.registerListener foo.1\naddress = http://client.example.org`,
    title: "The client asks to be told",
    body: `Two addresses, two different jobs. Step 1's <code>target</code> is a worker address — it is
           how the server finds someone willing to <em>run</em> <code>foo</code>. This is a client
           address, where the answer is <em>delivered</em>. Registering it is a separate act because the
           party that starts an execution and the party that wants the answer need not be the same, or
           alive at the same time.`,
  },
  4: {
    wire: `promise.registerListener res foo.1, registered`,
    title: "Registered",
    body: `The subscription is durable too, so it survives the wait — no socket held open, no polling
           loop. It is now part of <code>foo.1</code>'s record, which is why the state below gains a
           listener without the promise itself changing.`,
  },
  5: {
    wire: `task.execute foo.1, ver=0`,
    title: "Dispatched to Worker A",
    body: `The server offers the task to a worker subscribed to <code>http://worker.example.org</code>. Worker A gets
              it, but only because it happened to be there — nothing about <code>foo</code> belongs to
              Worker A yet. The offer carries a version, and it has to: the dispatch may be redelivered or
              raced, and the version is what decides which single worker ends up holding the task.`,
  },
  6: {
    wire: `task.acquire req foo.1, ver=0`,
    title: "Worker A acquires",
    body: `The worker claims the task at the version it was offered, and holds it for a lease.`,
  },
  7: {
    wire: `task.acquire res foo.1, preload=[]`,
    title: "Claimed",
    body: `Worker A may now advance <code>foo</code> — and, until the lease lapses, no one else may.`,
  },
  8: {
    lines: [1],
    wire: `execute until blocked(foo, 5)`,
    title: "foo starts, first pass",
    body: `Worker A starts a program instance at <code>foo</code>'s entry point with <code>n = 5</code>.
              It runs ordinary code until it reaches something durable.`,
  },
  9: {
    lines: [2],
    wire: `yield promise.create foo.1:1\nparam = bar(5)\ntarget = http://worker.example.org`,
    title: "context.rpc(bar, n)",
    body: `The rpc call does not invoke <code>bar</code>. It asks for a promise — <code>foo.1:1</code> —
              whose eventual value is <code>bar(5)</code>. Calling a function has become writing down that
              a function should be called.
              <span class="note">The id is derived, not invented: <code>foo.1</code> is the parent, and
              <code>:1</code> is the first promise this execution creates. No clock, no random source —
              which is exactly why the replay in step 27, running the same line for the second time,
              asks for this very promise instead of a new one.</span>`,
  },
  10: {
    wire: `task.fence foo.1, ver=1\n  promise.create foo.1:1\n  param = bar(5)\n  target = http://worker.example.org`,
    title: "The same create, wrapped in the claim",
    body: `Look at what is inside the fence: it is step 1 again. The client's request and the program's
              request are the same kind of thing — create this promise, with these arguments, deliverable
              here — and a nested call is only that request arriving from inside an execution instead of
              from outside the system.
              <span class="note">The envelope is what differs. <code>task.fence foo.1, ver=1</code> says
              this create is being made by whoever currently holds <code>foo.1</code> at that version. A
              worker whose claim has lapsed is refused here, which is why a program cannot half-advance an
              execution it no longer owns.</span>`,
  },
  11: {
    wire: `promise.create res foo.1:1, pending`,
    title: "foo.1:1 exists, pending",
    body: `The server records <code>foo.1:1</code> and — because it now has a promise with a target and
              no result — has a second piece of work to schedule. That is the dispatch in step 16.`,
  },
  12: {
    lines: [2],
    wire: `promise.create res foo.1:1, pending`,
    title: "The program gets its promise",
    body: `<code>p</code> is now bound to a pending promise. The next line is where that matters.`,
  },
  13: {
    lines: [3],
    wire: `suspended blocked=[foo.1:1]`,
    title: "await p — nothing to await yet",
    body: `<code>foo.1:1</code> has no value, so this pass of <code>foo</code> is over. Not failed,
               not parked: over. The program reports what it is waiting on and stops existing.`,
  },
  14: {
    wire: `task.suspend foo.1`,
    title: "Worker A lets go",
    body: `The claim goes back to the server. From here until step 23 <em>no process anywhere is
               holding foo</em> — no thread, no stack, no memory. Worker A could be shut down now and
               nothing would be lost. This is the step that separates durable execution from a program
               that merely waits.`,
  },
  15: {
    wire: `task.suspend res foo.1, released`,
    title: "Released — or not",
    body: `The suspend is answered, and on the happy path nothing is done with the answer. It matters
               when it is a refusal: had <code>foo.1:1</code> settled while the program was reporting
               back, there would be nothing left to wait for, and the server would say so rather than let
               <code>foo.1</code> stand down with a runnable promise underneath it. Watch its task below:
               <code>suspended</code>, held at the version it was acquired with, and no worker against it.
               <span class="note">The suspend carried a callback with it —
               <code>register_callback(awaited: foo.1:1, awaiter: foo.1)</code> — which is the
               <em>wakes foo.1</em> now sitting on that row in the state below. A worker on its way out arranges
               its own resumption; without it nothing would know to run <code>foo</code> again.</span>`,
  },
  16: {
    wire: `task.execute foo.1:1, ver=0`,
    title: "bar is dispatched — to a different worker",
    body: `<code>foo.1:1</code> is just another task, so it goes to whichever worker is available. Here
               that is Worker B. The call graph of the program does not have to fit on one machine.`,
  },
  17: {
    wire: `task.acquire req foo.1:1, ver=0`,
    title: "Worker B acquires",
    body: `The same claim protocol as Worker A used. Worker B knows nothing about <code>foo</code>
               and does not need to.`,
  },
  18: { wire: `task.acquire res foo.1:1, preload=[]`, title: "Claimed", body: `Worker B holds <code>foo.1:1</code>.` },
  19: {
    lines: [7, 8],
    wire: `execute until blocked(bar, 5)`,
    title: "bar runs",
    body: `A program instance starts at <code>bar</code> with <code>n = 5</code>. It touches no
               promises, so it never has to stop.`,
  },
  20: {
    lines: [8],
    wire: `completed = 10`,
    title: "bar returns 10",
    body: `<code>n * 2</code> with <code>n = 5</code>. This is the only time <code>bar</code>'s body
               ever executes — worth holding onto through the replay that follows.`,
  },
  21: {
    wire: `task.fulfill foo.1:1, resolved, 10`,
    title: "foo.1:1 is resolved",
    body: `Worker B settles the promise with <code>10</code> and releases the task. The server now
               sees that <code>foo</code> was blocked on <code>foo.1:1</code> and that it no longer is,
               which makes <code>foo</code> runnable again.`,
  },
  22: {
    wire: `task.fulfill res foo.1:1, fulfilled`,
    title: "The write is acknowledged",
    body: `<code>10</code> is durable and <code>foo.1:1</code> is closed. Worker B does nothing with
               this on the happy path, but until it arrives the worker cannot know the value was the one
               recorded — a refusal would mean its claim had lapsed and someone else settled the
               promise.`,
  },
  23: {
    wire: `task.execute foo.1, ver=1`,
    title: "foo is dispatched again — to Worker B",
    body: `The next pass of <code>foo</code> lands on Worker B, which has never run <code>foo</code>
               before. Worker A may have been redeployed, scaled down, or crashed; it makes no
               difference. Nothing about the execution lived there.`,
  },
  24: {
    wire: `task.acquire req foo.1, ver=1`,
    title: "Worker B acquires foo",
    body: `A new version, since the task has been dispatched again. If Worker A ever came back holding
               the old version, it would be refused — which is what makes handing work between workers
               safe.`,
  },
  25: {
    wire: `task.acquire res foo.1, preload=[]`,
    title: "Claimed",
    body: `Worker B may now advance <code>foo</code>.`,
  },
  26: {
    lines: [1],
    wire: `execute until blocked(foo, 5)`,
    title: "A fresh program, from the top",
    body: `Worker B starts <code>foo</code> at its entry point with <code>n = 5</code> — the same way
               Worker A did in step 8. No stack is restored and no coroutine is resumed. The function
               body runs again from line 1. <em>It replays; it does not resume.</em>`,
  },
  27: {
    lines: [2],
    wire: `yield promise.create foo.1:1\nparam = bar(5)\ntarget = http://worker.example.org`,
    title: "The same rpc line, reached again",
    body: `Replay means <code>context.rpc(bar, n)</code> executes a second time — and because the id
               is derived, not invented, it asks for the same <code>foo.1:1</code> as before.`,
  },
  28: {
    wire: `task.fence foo.1, ver=2\n  promise.create foo.1:1\n  param = bar(5)\n  target = http://worker.example.org`,
    title: "The same envelope, a new claim",
    body: `Byte for byte the request Worker A sent in step 10, under a different claim —
               <code>ver=2</code>, because this is a later dispatch and a different worker. Every durable
               step goes through the fence on every pass; there is no fast path that skips it, and the
               guarantee holds precisely because it is unconditional.`,
  },
  29: {
    lines: [2],
    wire: `promise.create res foo.1:1, resolved, 10`,
    title: "Already resolved — so bar does not run again",
    body: `Create is idempotent on the id, so instead of a second <code>foo.1:1</code> the server hands
               back the one that already carries <code>10</code>. This is the step that pays for
               everything else: work that completed on an earlier pass is <em>read</em>, not redone.`,
  },
  30: {
    lines: [3],
    wire: `promise.create res foo.1:1, resolved, 10`,
    title: "await p returns immediately",
    body: `The line that ended the first pass is now the line that walks straight through.
               <code>v = 10</code>, and <code>foo</code> continues past the point where it previously
               stopped — carried there by the promise, not by saved state.`,
  },
  31: {
    lines: [4],
    wire: `completed = 10`,
    title: "foo returns 10",
    body: `<code>return v</code>. This pass reaches the end of the function, which is the outcome that
               ends the loop instead of continuing it.`,
  },
  32: {
    wire: `task.fulfill foo.1, resolved, 10`,
    title: "foo is resolved",
    body: `Worker B settles the root promise and releases the task. Idempotent like every other write
               here, so a redelivery of this message changes nothing.`,
  },
  33: {
    wire: `task.fulfill res foo.1, fulfilled`,
    title: "And the root is closed",
    body: `The same acknowledgement for the root promise. Every write in this diagram is answered;
               these two are simply the ones the happy path never has to read.`,
  },
  34: {
    wire: `deliver foo.1 = 10`,
    title: "The client is notified",
    body: `Delivered to <code>http://client.example.org</code>, the address the listener named in step 3 — not the
           target from step 1, which routed the task to a worker. Two workers, two
               passes of <code>foo</code>, one execution of <code>bar</code>, and a client that only ever
               asked for <code>foo(5)</code>.`,
  },
};
