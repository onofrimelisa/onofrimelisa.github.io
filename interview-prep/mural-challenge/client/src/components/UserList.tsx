interface UserListProps {
  users: string[];
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) return null;

  return (
    <div className="user-list">
      {users.map((user) => (
        <span key={user} className="user-pill">
          <span className="user-dot" />
          {user}
        </span>
      ))}
    </div>
  );
}
