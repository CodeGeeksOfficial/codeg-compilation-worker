import amqp from 'amqplib';
import { config } from 'dotenv';

config();

const url = process.env.RABBITMQ_URL || '';

export const connectQueue = async () => {
  console.log("[worker] Connecting to Queues");
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  channel.assertQueue("singleExecutionJobs");
  console.log("[worker] Connected to Queue - singleExecutionJobs");
  
  channel.assertQueue("multiExecutionJobs");
  console.log("[worker] Connected to Queue - multiExecutionJobs");
  return channel;
}

export default connectQueue;