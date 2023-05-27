import connectQueue from "../config/rabbitmq";
import processJob from "../utils/jobProcessing";
import { setKey } from "./redis-controllers";

const startListening = async () => {
  try {
    let channel: any;
    if (!channel) {
      channel = await connectQueue();
    }


    console.log("[worker] Listening for requests");
    // *** Start Processing Jobs *** //
    channel.consume("jobs", async (data: any) => {
      channel.ack(data); // Acknowledge (delete) job from queue
      const job = JSON.parse(data.content.toString());
      await setKey(job.folder_name, "Processing");

      try {
        await processJob(job);
      } catch (err) {
        console.log(`Error while Processing Job: ${err}`);
      }
    });
  } catch (err) {
    console.log(`Unable to process jobs on Worker Node, Error: ${err}`);
  }
};

export default startListening;