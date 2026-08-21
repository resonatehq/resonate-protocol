// Detail copy for each autonumbered message, keyed by step number.
// The page folds every pass into one loop, so several steps describe both the
// pass that suspends and the pass that completes.
export const STEPS = {
  1: {
    wire: `promise.create id\nparam = func(args)\ntarget = worker-url`,
    title: "The client records intent",
    body: `The client writes down what it wants — the function, its arguments, and where the resulting
              task should be routed. Creating the promise <em>is</em> the durable act: from here the work exists
              independently of the client, the worker, or any process that happens to be alive.`,
  },
  2: {
    wire: `promise.create res id, pending`,
    title: "Accepted, pending",
    body: `The promise is in durable storage in the <code>pending</code> state and the call returns
              immediately. The client may disconnect; completion is delivered later, to the target.`,
  },
  3: {
    wire: `promise.registerListener id\naddress = client-url`,
    title: "The client asks to be told",
    body: `Two addresses, two different jobs. The target on the create routes the <em>task</em> — it
              is how the server finds a worker willing to run this. A listener address is where the
              <em>client</em> hears back, and registering it is a separate act because the party that
              starts an execution and the party that wants the answer need not be the same, or alive at
              the same time.
              <span class="note">Two operations register interest in a promise: a listener names an
              address to deliver to, and a callback names another promise to unblock. This is the first;
              the second is what makes a nested call resume its parent.</span>`,
  },
  4: {
    wire: `promise.registerListener res id, registered`,
    title: "Registered",
    body: `The subscription is durable too, so it survives the wait. Nothing is held open — no socket,
              no polling loop — and if the promise is already settled when this arrives, the notification
              fires immediately rather than never.`,
  },
  5: {
    wire: `task.execute id, ver=n`,
    title: "Dispatched",
    body: `The server offers the task to a worker subscribed to the target. This is a hint, not a
              handoff: the server still owns the task, and if the message is lost or the worker is gone it
              simply dispatches again.
              <span class="note">Every trip round this loop is a new dispatch with a new version. The
              worker that ran the previous pass may be gone; nothing about the execution lived there.</span>`,
  },
  6: {
    wire: `task.acquire req id, ver=n`,
    title: "A worker acquires the task",
    body: `The worker claims the task, echoing the version it was offered. The version is the whole
              safety argument: a worker that stalls and comes back holding an old version after the task
              has moved on will lose this race and be told so.`,
  },
  7: {
    wire: `task.acquire res id, preload=[...]`,
    title: "Claim granted",
    body: `The worker holds the task for a lease, and <code>preload</code> comes back with it: promise
              state the server already knows the program will ask for. Empty means the worker fetches each
              promise as the program reaches it, one fenced round trip at a time; a non-empty preload is
              the same protocol with those round trips already paid for.`,
  },
  8: {
    wire: `execute until blocked(func, args)`,
    title: "A fresh program, from the top",
    body: `The worker starts a program instance at the entry point with the original arguments — on
              this pass and on every later one. No stack is restored, no continuation unpickled, no
              coroutine resumed. <em>It replays; it does not resume.</em> What carries it back to where it
              left off is not saved state but the promises it is about to touch.`,
  },
  9: {
    wire: `promise.create id:n | promise.settle id:n`,
    title: "The program reaches a durable step",
    body: `Creating or settling a promise is not something the program may do on its own — the step has
              to be recorded before it can take effect. So the program yields the intent to the worker
              rather than performing it. On a later pass this same line is reached again, in the same
              order; the program does not know which pass it is on and does not need to.
              <span class="note"><code>id:n</code> is the n-th promise this execution creates — the
              parent's id and the position of the call within it. Derived, not invented, which is why a
              replay asks for the same promise instead of making a new one.</span>`,
  },
  10: {
    wire: `task.fence id, ver=n\n  promise.create id:n | promise.settle id:n`,
    title: "The same request, wrapped in the claim",
    body: `Look at what is inside the fence: it is step 1 again. The client's request and the program's
              request are the same kind of thing, and a nested call is only that request arriving from
              inside an execution instead of from outside the system.
              <span class="note">The envelope is what differs. The fence says this request is made by
              whoever holds <code>id</code> at that version; a worker whose claim has lapsed is refused.
              Every durable step goes through it on every pass — there is no fast path that skips it, and
              the guarantee holds precisely because it is unconditional.</span>`,
  },
  11: {
    wire: `promise.create res | promise.settle res, pending | settled`,
    title: "The server answers with promise state",
    body: `The promise comes back in whatever state it is actually in. <code>pending</code> the first
              time anyone asks for it; <code>settled</code> once it carries a value — and a step that
              comes back settled is a step the program does not redo. That is the whole economy of replay:
              work already completed is read, not repeated.
              <span class="note">Create is idempotent on the id and settle keeps the first value written,
              so the same step taken again on a later pass returns the same answer. That is what makes
              replay deterministic rather than merely repeated.</span>`,
  },
  12: {
    wire: `promise.create res | promise.settle res, pending | settled`,
    title: "The result reaches the program",
    body: `The program receives the promise as the server sees it and carries on. Its own local state
               is irrelevant to correctness — the server's copy is the truth.`,
  },
  13: {
    wire: `suspended blocked=[...] | completed = value`,
    title: "The pass ends, one of two ways",
    body: `Either there is nothing left to run and the program names the promises it is waiting on, or
               it reaches the end of the function and produces a value. Suspension is not failure and not
               an error path; it is the ordinary way a pass ends when the next step depends on something
               that has not happened yet. Completion is the outcome that ends the loop instead of
               continuing it.`,
  },
  14: {
    wire: `task.suspend id | task.fulfill id, resolved, value`,
    title: "The worker lets go, or settles",
    body: `A suspended pass hands the claim back: from here until the next dispatch <em>no process
               anywhere holds this execution</em> — no thread, no stack, no memory. A completed pass
               settles the root promise with the value instead. Dispatch, run, block, release: that is the
               loop this frame encloses, and the settle is how it stops.`,
  },
  15: {
    wire: `task.suspend res id, released | task.fulfill res id, fulfilled`,
    title: "Released — or not",
    body: `The release is answered, and the happy path ignores the answer. It matters when it is a
               refusal: if a blocking promise settled while the program was reporting back, the server has
               nothing to wait for and says so, and the worker runs the next pass instead of standing
               down. Suspension is only correct if nothing became runnable in the meantime, and this is
               where that is checked. A refused fulfil means the claim had lapsed and this worker's value
               was not the one recorded.`,
  },
  16: {
    wire: `unblock id = value`,
    title: "The client is notified",
    body: `The listener registered in step 3 fires. This is not an answer to anything the client is
               waiting on — it arrives out of band, possibly long after, at an address that may have
               listeners on many promises — so it names its subject: which promise settled, and to what.
               Whoever started this may be long gone; the promise, and its value, outlived them.`,
  },
};
