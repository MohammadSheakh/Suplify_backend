// redis.ts
import { createClient } from 'redis';
import colors from 'colors';
import { errorLogger, logger } from '../shared/logger';

// Create Redis clients
const redisPubClient = createClient({
  host: '172.22.201.132',  // Update with your Redis configuration
  port: 6379,
});

const redisSubClient = redisPubClient.duplicate();

// For general caching operations, we'll use the pub client
export const redisClient = redisPubClient;

// Export both clients if needed for Socket.IO adapter
export { redisPubClient, redisSubClient };

// Connection event handlers
redisPubClient.on('ready', () => {
  logger.info(colors.green('♨️  Redis Pub Client ready'));
});

redisPubClient.on('error', (err) => {
  errorLogger.error('Redis Pub Client Error:', err);
});

redisSubClient.on('ready', () => {
  logger.info(colors.green('♨️  Redis Sub Client ready'));
});

redisSubClient.on('error', (err) => {
  logger.error('Redis Sub Client Error:', err);
});

// Initialize Redis connections
export async function initializeRedis() {
  try {
    await Promise.all([
      redisPubClient.connect(),
      redisSubClient.connect()
    ]);
    logger.info(colors.green('✅ Redis clients connected successfully'));
  } catch (error) {
    logger.error('Failed to connect Redis clients:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeRedisConnections() {
  try {
    await Promise.all([
      redisPubClient.quit(),
      redisSubClient.quit()
    ]);
    logger.info('Redis connections closed');
  } catch (error) {
    errorLogger.error('Error closing Redis connections:', error);
  }
}