import amqp from 'amqplib';
import { config } from 'dotenv';

config();

const url = process.env.RABBITMQ_URL || '';

export const connectQueue = async () => {
  console.log("[worker] Connecting to Queue");
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  channel.assertQueue("jobs");
  console.log("[worker] Connected to Queue");
  return channel;
}

export default connectQueue;