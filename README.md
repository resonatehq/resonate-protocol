# Resonate Protocol

A transport-agnostic durable execution protocol.

## Version

`2026-04-01`

## Documentation

| File | Description |
|------|-------------|
| [spec/protocol.md](spec/protocol.md) | Protocol specification including requests, responses, and messages |
| [spec/transitions-promises.md](spec/transitions-promises.md) | Promise state transitions, including side effects and response statuses |
| [spec/transitions-tasks.md](spec/transitions-tasks.md) | Task state transitions, including side effects and response statuses |
| [spec/transitions-schedules.md](spec/transitions-schedules.md) | Schedule state transitions, including side effects and response statuses |

## Types

| File | Description |
|------|-------------|
| [spec/types-zod.ts](spec/types-zod.ts) | Zod schemas for runtime validation |
| [spec/types-raw.ts](spec/types-raw.ts) | Raw TypeScript types (no dependencies) |
| [spec/types.json](spec/types.json) | JSON Schema for all request, response, and message types |

## gRPC

| File | Description |
|------|-------------|
| [spec/grpc/types.proto](spec/grpc/types.proto) | Shared types (promises, tasks, schedules, request/response heads) |
| [spec/grpc/promises.proto](spec/grpc/promises.proto) | PromiseService and promise request/response types |
| [spec/grpc/tasks.proto](spec/grpc/tasks.proto) | TaskService and task request/response types |
| [spec/grpc/schedules.proto](spec/grpc/schedules.proto) | ScheduleService and schedule request/response types |
| [spec/grpc/debug.proto](spec/grpc/debug.proto) | DebugService and debug request/response types |
| [spec/grpc/messages.proto](spec/grpc/messages.proto) | Messages sent by the server to worker addresses |
