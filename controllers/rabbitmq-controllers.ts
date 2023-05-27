import connectQueue from "../config/rabbitmq";
import { processClassicJob, processJudgeJob } from "../utils/jobProcessing";
import { setKey } from "./redis-controllers";

const startListening = async () => {
  try {
    let channel: any;
    if (!channel) {
      channel = await connectQueue();
    }

    console.log("[worker] Listening for requests");
    
    // *** Start Processing Jobs *** //
    channel.consume("singleExecutionJobs", async (data: any) => {
      channel.ack(data); // Acknowledge (delete) job from queue
      const job = JSON.parse(data.content.toString());
      await setKey(job.folder_name, "Processing");

      try {
        await processClassicJob(job);
      } catch (err) {
        console.log(`Error while Processing Job: ${err}`);
      }
    });

    channel.consume("multiExecutionJobs", async (data: any) => {
      channel.ack(data); // Acknowledge (delete) job from queue
      const job = JSON.parse(data.content.toString());
      await setKey(job.folder_name, "Processing");

      try {
        await processJudgeJob(job);
      } catch (err) {
        console.log(`Error while Processing Job: ${err}`);
      }
    });
  } catch (err) {
    console.log(`Unable to process jobs on Worker Node, Error: ${err}`);
  }
};

export default startListening;