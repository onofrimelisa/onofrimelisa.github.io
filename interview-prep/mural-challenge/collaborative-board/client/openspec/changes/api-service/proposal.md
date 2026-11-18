# Change 8: API Service

## What & Why

Provide an HTTP API layer for login and CSV import using the native fetch API. Keeps network concerns isolated from React components and hooks.

The service handles two endpoints: POST /api/auth/login for JWT token acquisition and POST /api/boards/default/import for file upload with Bearer auth.
