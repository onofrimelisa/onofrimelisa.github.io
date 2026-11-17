## Why
The composition root wires all layers together: database connections, service instantiation, route mounting, and Socket.io middleware. Redis adapter enables horizontal scaling across multiple server instances.

## What Changes
- Create Redis connection helper with pub/sub adapter for Socket.io
- Create main entry point (src/index.ts) that bootstraps the entire server

## Capabilities
### New Capabilities
- `config/redis`: Redis pub/sub connection + Socket.io adapter factory
- `bootstrap/main`: Full server startup orchestration
