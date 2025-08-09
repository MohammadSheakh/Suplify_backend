import { redisClient } from "./redis";

export function getOrSetRedisCache(
  key: string,
  cb: () => Promise<any>,
  ttl = 3600 // default TTL of 1 hour
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return resolve(JSON.parse(cachedData));
      }

      const data = await cb();
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}