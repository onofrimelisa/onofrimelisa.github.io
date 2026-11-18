## Why
The repository pattern decouples data access from business logic, enabling testability via in-memory implementations and flexibility to swap storage backends.

## What Changes
- Define INoteRepository interface with CRUD operations
- Implement MongoNoteRepository backed by MongoDB
- Implement InMemoryNoteRepository for unit tests
- Create database connection helper with index creation

## Capabilities
### New Capabilities
- `data/repository`: Abstract note persistence interface
- `data/mongo`: MongoDB-backed repository implementation
- `data/in-memory`: Test double for repository
- `config/database`: MongoDB connection and index setup
