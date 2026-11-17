## Why
Socket.io needs typed event contracts to ensure type safety between client and server. Defining these before handlers prevents mismatched event names or payloads.

## What Changes
- Define ServerToClientEvents interface (events the server emits)
- Define ClientToServerEvents interface (events the client emits)
- Define SocketData interface for per-socket state

## Capabilities
### New Capabilities
- `transport/socket-contract`: Typed Socket.io event interfaces
