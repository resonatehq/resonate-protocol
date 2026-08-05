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

Published to the Buf Schema Registry as [buf.build/resonatehq/resonate](https://buf.build/resonatehq/resonate).

| File | Description |
|------|-------------|
| [spec/grpc/resonate/v1/types.proto](spec/grpc/resonate/v1/types.proto) | Shared types (promises, tasks, schedules, request/response heads) |
| [spec/grpc/resonate/v1/promises.proto](spec/grpc/resonate/v1/promises.proto) | PromiseService and promise request/response types |
| [spec/grpc/resonate/v1/tasks.proto](spec/grpc/resonate/v1/tasks.proto) | TaskService and task request/response types |
| [spec/grpc/resonate/v1/schedules.proto](spec/grpc/resonate/v1/schedules.proto) | ScheduleService and schedule request/response types |
| [spec/grpc/resonate/v1/debug.proto](spec/grpc/resonate/v1/debug.proto) | DebugService and debug request/response types |
| [spec/grpc/resonate/v1/messages.proto](spec/grpc/resonate/v1/messages.proto) | Messages sent by the server to worker addresses |
