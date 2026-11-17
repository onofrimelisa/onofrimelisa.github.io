import jwt from 'jsonwebtoken';

export class AuthService {
  constructor(private jwtSecret: string) {}

  login(username: string): { token: string; username: string } {
    const trimmed = username.trim();
    if (!trimmed) {
      throw new Error('Username is required');
    }
    const token = jwt.sign({ username: trimmed }, this.jwtSecret, { expiresIn: '24h' });
    return { token, username: trimmed };
  }

  verifyToken(token: string): { username: string } | null {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { username: string };
      return { username: payload.username };
    } catch {
      return null;
    }
  }
}
