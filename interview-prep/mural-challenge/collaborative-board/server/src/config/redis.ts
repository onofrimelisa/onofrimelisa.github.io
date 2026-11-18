import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

export async function connectToRedis(url: string) {
  const pubClient = createClient({ url });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  console.log('Connected to Redis');
  return { pubClient, subClient, adapter: createAdapter(pubClient, subClient) };
}
