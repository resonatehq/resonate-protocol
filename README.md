# Resonate Protocol

A transport-agnostic durable execution protocol.

## Version

`2026-04-01`

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
| [spec/grpc/resonate/v1/resonate.proto](spec/grpc/resonate/v1/resonate.proto) | ResonateService exposing all promise, task, schedule, and debug operations |
| [spec/grpc/resonate/v1/types.proto](spec/grpc/resonate/v1/types.proto) | Shared types (promises, tasks, schedules, request/response heads) |
| [spec/grpc/resonate/v1/promises.proto](spec/grpc/resonate/v1/promises.proto) | Promise request/response types |
| [spec/grpc/resonate/v1/tasks.proto](spec/grpc/resonate/v1/tasks.proto) | Task request/response types |
| [spec/grpc/resonate/v1/schedules.proto](spec/grpc/resonate/v1/schedules.proto) | Schedule request/response types |
| [spec/grpc/resonate/v1/debug.proto](spec/grpc/resonate/v1/debug.proto) | Debug request/response types |
| [spec/grpc/resonate/v1/messages.proto](spec/grpc/resonate/v1/messages.proto) | Messages sent by the server to worker addresses |
