## Design

### Startup Sequence
1. Connect to MongoDB (with index creation)
2. Connect to Redis (pub + sub clients)
3. Create services (NoteRepository, NoteService, AuthService)
4. Create Express app + HTTP server
5. Create Socket.io server with Redis adapter
6. Mount HTTP routes (auth + board import)
7. Register Socket.io auth middleware (JWT verification)
8. Register Socket.io connection handler (delegates to board + note handlers)
9. Listen on configured port

### Redis Adapter
- Two Redis clients (pub/sub) enable Socket.io to broadcast events across multiple server instances
- This is critical for horizontal scaling behind a load balancer

### Configuration
- All config via environment variables with sensible development defaults
- INSTANCE_ID for log disambiguation in multi-instance deployments
