import { useState } from 'react';

interface UsernamePromptProps {
  onLogin: (username: string) => void;
  error: string | null;
  loading: boolean;
}

export function UsernamePrompt({ onLogin, error, loading }: UsernamePromptProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      onLogin(trimmed);
    }
  };

  return (
    <div className="prompt-overlay">
      <form className="prompt-card" onSubmit={handleSubmit}>
        <h1>Mural Board</h1>
        <p>Enter your name to join the collaborative board</p>
        <input
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          disabled={loading}
          maxLength={50}
        />
        <button type="submit" disabled={loading || !username.trim()}>
          {loading ? 'Joining...' : 'Join Board'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
