# Change 9: React Hooks

## What & Why

Encapsulate socket.io connection management and board state in reusable React hooks. `useSocket` manages the WebSocket lifecycle tied to auth token, while `useBoard` handles joining the board, listening for events, and providing action callbacks.

This separation keeps components thin and focused on rendering while hooks own the real-time communication logic.
