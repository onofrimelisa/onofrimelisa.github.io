import { useCallback, useState } from 'react';
import { login } from './services/api';
import { UsernamePrompt } from './components/UsernamePrompt';
import { Board } from './components/Board';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = useCallback(async (name: string) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const result = await login(name);
      localStorage.setItem('token', result.token);
      localStorage.setItem('username', result.username);
      setToken(result.token);
      setUsername(result.username);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  }, []);

  if (!token || !username) {
    return <UsernamePrompt onLogin={handleLogin} error={loginError} loading={loginLoading} />;
  }

  return <Board token={token} username={username} onLogout={handleLogout} />;
}

export default App;
