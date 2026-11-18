import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/auth.service.js';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  router.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      if (!username || typeof username !== 'string') {
        res.status(400).json({ error: 'Username is required' });
        return;
      }
      const result = authService.login(username);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
