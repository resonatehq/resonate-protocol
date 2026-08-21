// The messages behind each arrow, in the shapes the SDK defines in
// src/network/types.ts (resonatehq/resonate-sdk-ts): every request is
// { kind, head, data }, every response { kind, head: { corrId, status, version }, data },
// and the two server-pushed messages are { kind: "execute" | "unblock", head, data }.
//
// null marks a step that crosses the SDK boundary rather than the network —
// the worker calling into the program, and what the program yields back.
//
// param.data and value.data are base64 on the wire, per spec/protocol.md in
// resonatehq/resonate-protocol. They are written here as the objects they
// encode, and the panel decodes them back under the message.

const b64 = (o) => btoa(JSON.stringify(o));
const FOO_CALL = b64({ func: "foo", args: [5] });
const BAR_CALL = b64({ func: "bar", args: [5] });
const TEN = b64(10);

const FOO_PENDING = `{
      "id": "foo.1",
      "state": "pending",
      "param": { "data": "${FOO_CALL}" },
      "value": {},
      "tags": { "resonate:target": "http://worker.example.org" },
      "timeoutAt": 1767225600000,
      "createdAt": 1767139200000
    }`;

const CHILD_PENDING = `{
        "id": "foo.1:1",
        "state": "pending",
        "param": { "data": "${BAR_CALL}" },
        "value": {},
        "tags": { "resonate:target": "http://worker.example.org" },
        "timeoutAt": 1767225600000,
        "createdAt": 1767139205000
      }`;

const CHILD_RESOLVED = `{
        "id": "foo.1:1",
        "state": "resolved",
        "param": { "data": "${BAR_CALL}" },
        "value": { "data": "${TEN}" },
        "tags": { "resonate:target": "http://worker.example.org" },
        "timeoutAt": 1767225600000,
        "createdAt": 1767139205000,
        "settledAt": 1767139211000
      }`;

const createChild = (corr) => `{
    "kind": "promise.create",
    "head": { "corrId": "${corr}", "version": "1" },
    "data": {
      "id": "foo.1:1",
      "timeoutAt": 1767225600000,
      "param": { "data": "${BAR_CALL}" },
      "tags": { "resonate:target": "http://worker.example.org" }
    }
  }`;

const acquire = (corr, task, ver, pid) => `{
  "kind": "task.acquire",
  "head": { "corrId": "${corr}", "version": "1" },
  "data": { "id": "${task}", "version": ${ver}, "pid": "${pid}", "ttl": 30000 }
}`;

const execute = (task, ver) => `{
  "kind": "execute",
  "head": { "serverUrl": "https://resonate.example.org" },
  "data": { "task": { "id": "${task}", "version": ${ver} } }
}`;

export const WIRE = {
  1: `{
  "kind": "promise.create",
  "head": { "corrId": "c-1", "version": "1" },
  "data": {
    "id": "foo.1",
    "timeoutAt": 1767225600000,
    "param": { "data": "${FOO_CALL}" },
    "tags": { "resonate:target": "http://worker.example.org" }
  }
}`,
  2: `{
  "kind": "promise.create",
  "head": { "corrId": "c-1", "status": 200, "version": "1" },
  "data": {
    "promise": ${FOO_PENDING}
  }
}`,
  3: `{
  "kind": "promise.register_listener",
  "head": { "corrId": "c-1b", "version": "1" },
  "data": {
    "awaited": "foo.1",
    "address": "http://client.example.org"
  }
}`,
  4: `{
  "kind": "promise.register_listener",
  "head": { "corrId": "c-1b", "status": 200, "version": "1" },
  "data": {
    "promise": ${FOO_PENDING}
  }
}`,
  5: execute("foo.1", 0),
  6: acquire("c-2", "foo.1", 0, "worker-a"),
  7: `{
  "kind": "task.acquire",
  "head": { "corrId": "c-2", "status": 200, "version": "1" },
  "data": {
    "task": { "id": "foo.1", "state": "acquired", "version": 1, "resumes": [], "ttl": 30000, "pid": "worker-a" },
    "promise": ${FOO_PENDING},
    "preload": []
  }
}`,
  8: null,
  9: null,
  10: `{
  "kind": "task.fence",
  "head": { "corrId": "c-3", "version": "1" },
  "data": {
    "id": "foo.1",
    "version": 1,
    "action": ${createChild("c-3.1")}
  }
}`,
  11: `{
  "kind": "task.fence",
  "head": { "corrId": "c-3", "status": 200, "version": "1" },
  "data": {
    "action": {
      "kind": "promise.create",
      "head": { "corrId": "c-3.1", "status": 200, "version": "1" },
      "data": { "promise": ${CHILD_PENDING} }
    },
    "preload": []
  }
}`,
  12: null,
  13: null,
  14: `{
  "kind": "task.suspend",
  "head": { "corrId": "c-4", "version": "1" },
  "data": {
    "id": "foo.1",
    "version": 1,
    "actions": [
      {
        "kind": "promise.register_callback",
        "head": { "corrId": "c-4.1", "version": "1" },
        "data": { "awaited": "foo.1:1", "awaiter": "foo.1" }
      }
    ]
  }
}`,
  15: `{
  "kind": "task.suspend",
  "head": { "corrId": "c-4", "status": 200, "version": "1" },
  "data": {}
}`,
  16: execute("foo.1:1", 0),
  17: acquire("c-5", "foo.1:1", 0, "worker-b"),
  18: `{
  "kind": "task.acquire",
  "head": { "corrId": "c-5", "status": 200, "version": "1" },
  "data": {
    "task": { "id": "foo.1:1", "state": "acquired", "version": 1, "resumes": [], "ttl": 30000, "pid": "worker-b" },
    "promise": ${CHILD_PENDING},
    "preload": []
  }
}`,
  19: null,
  20: null,
  21: `{
  "kind": "task.fulfill",
  "head": { "corrId": "c-6", "version": "1" },
  "data": {
    "id": "foo.1:1",
    "version": 1,
    "action": {
      "kind": "promise.settle",
      "head": { "corrId": "c-6.1", "version": "1" },
      "data": { "id": "foo.1:1", "state": "resolved", "value": { "data": "${TEN}" } }
    }
  }
}`,
  22: `{
  "kind": "task.fulfill",
  "head": { "corrId": "c-6", "status": 200, "version": "1" },
  "data": {
    "promise": ${CHILD_RESOLVED}
  }
}`,
  23: execute("foo.1", 1),
  24: acquire("c-7", "foo.1", 1, "worker-b"),
  25: `{
  "kind": "task.acquire",
  "head": { "corrId": "c-7", "status": 200, "version": "1" },
  "data": {
    "task": { "id": "foo.1", "state": "acquired", "version": 2, "resumes": [], "ttl": 30000, "pid": "worker-b" },
    "promise": ${FOO_PENDING},
    "preload": []
  }
}`,
  26: null,
  27: null,
  28: `{
  "kind": "task.fence",
  "head": { "corrId": "c-8", "version": "1" },
  "data": {
    "id": "foo.1",
    "version": 2,
    "action": ${createChild("c-8.1")}
  }
}`,
  29: `{
  "kind": "task.fence",
  "head": { "corrId": "c-8", "status": 200, "version": "1" },
  "data": {
    "action": {
      "kind": "promise.create",
      "head": { "corrId": "c-8.1", "status": 200, "version": "1" },
      "data": { "promise": ${CHILD_RESOLVED} }
    },
    "preload": []
  }
}`,
  30: null,
  31: null,
  32: `{
  "kind": "task.fulfill",
  "head": { "corrId": "c-9", "version": "1" },
  "data": {
    "id": "foo.1",
    "version": 2,
    "action": {
      "kind": "promise.settle",
      "head": { "corrId": "c-9.1", "version": "1" },
      "data": { "id": "foo.1", "state": "resolved", "value": { "data": "${TEN}" } }
    }
  }
}`,
  33: `{
  "kind": "task.fulfill",
  "head": { "corrId": "c-9", "status": 200, "version": "1" },
  "data": {
    "promise": {
      "id": "foo.1",
      "state": "resolved",
      "param": { "data": "${FOO_CALL}" },
      "value": { "data": "${TEN}" },
      "tags": { "resonate:target": "http://worker.example.org" },
      "timeoutAt": 1767225600000,
      "createdAt": 1767139200000,
      "settledAt": 1767139216000
    }
  }
}`,
  34: `{
  "kind": "unblock",
  "head": { "serverUrl": "https://resonate.example.org" },
  "data": {
    "promise": {
      "id": "foo.1",
      "state": "resolved",
      "param": { "data": "${FOO_CALL}" },
      "value": { "data": "${TEN}" },
      "tags": { "resonate:target": "http://worker.example.org" },
      "timeoutAt": 1767225600000,
      "createdAt": 1767139200000,
      "settledAt": 1767139216000
    }
  }
}`,
};
