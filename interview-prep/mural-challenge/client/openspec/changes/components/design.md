# Design: React Components

## Component Tree
```
App (auth gate)
  +-- UsernamePrompt (when no token)
  +-- Board (when authenticated)
       +-- Toolbar (color picker, import, logout)
       +-- UserList (presence badges)
       +-- StickyNote[] (draggable, editable notes)
```

## StickyNote
- Absolute positioning via left/top
- Mouse drag via mousedown/mousemove/mouseup on document
- Double-click for edit mode (textarea), blur/Enter to save
- Color-coded background, author label

## Board
- Full viewport, relative positioning
- Click empty space to create note at cursor position
- Toolbar: color cycle, file import, logout, connection status

## App
- Reads token/username from localStorage
- Shows UsernamePrompt or Board based on auth state
