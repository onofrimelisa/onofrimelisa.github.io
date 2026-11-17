# Change 7: Client Models

## What & Why

Define client-side TypeScript types that mirror the server's domain models for sticky notes and socket events. This ensures type safety across the client codebase and enables typed socket.io communication.

Having shared type definitions prevents mismatches between what the client sends/receives and what the server expects, catching errors at compile time rather than runtime.
