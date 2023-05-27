import Redis from "ioredis";
import { config } from 'dotenv';

config();

const client = new Redis(process.env.REDIS_URL || "");

process.on('exit', () => {
  console.log("[worker] Closing Redis Connection");
  client.quit();
});

export default client;