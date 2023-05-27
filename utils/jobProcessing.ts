import { setKey } from "../controllers/redis-controllers";
import executeFile from "./executeFile";
import { createFile } from "./generateFile";

function checkForInternalErrors(err: any) {
  if (err.error instanceof RangeError) {
    return "Runtime Error: Buffer Exceeded"
  } else if (err.error.signal == "SIGTERM") {
    return "TLE"
  }
}

export async function processJob(job: any) {
  createFile(job);
  return await executeFile(job);
}

export async function processClassicJob(job: any) {
  console.log(`[worker] Processing Classic Job - ${job.folder_name}`);
  let output: any;
  try {
    output = await processJob(job);
  } catch (err: any) {
    if (err.stderr) {
      output = err;
    } else {
      const internalError = checkForInternalErrors(err);
      if (internalError === "TLE") {
        output = {
          stderr: "Your code took too long to execute.",
          stdout: "",
        };
      } else if (internalError === "Runtime Error: Buffer Exceeded") {
        output = {
          stderr: "Your Output is too long.",
          stdout: "",
        };
      }
      else {
        console.log(`Error while job execution: ${job.folder_name}, ${err.error}`);
        output = {
          stderr: "Internal Server Error",
          stdout: "",
        };
      }
    }
  }
  setKey(job.folder_name, JSON.stringify(output));
}

export async function processJudgeJob(job: any) {
  console.log(`[worker] Processing Judge Job - ${job.folder_name}`);

  const testInputs = job.test_inputs;

  const results = testInputs.map(async (testInput: any, index: number) => {
    const userCodeJobData = {
      folder_name: `${job.folder_name}/${index.toString()}/usercode`,
      language: job.input_code.language,
      code: job.input_code.code,
      input: testInput.toString(),
      timeout: job.timeout
    }

    const solutionJobData = {
      folder_name: `${job.folder_name}/${index.toString()}/solution`,
      language: job.solution.language,
      code: job.solution.code.replace(/\\n/g, '\n'),
      input: testInput.toString(),
      timeout: job.timeout
    }

    let solutionOutput: any;
    let userCodeOutput: any;
    try {
      userCodeOutput = await processJob(userCodeJobData);
      solutionOutput = await processJob(solutionJobData);
      if (solutionOutput.stdout === userCodeOutput.stdout) {
        return "Success";
      } else {
        return "Wrong Answer"
      }
    } catch (err: any) {
      if (err.stderr) {
        return "Runtime Error"
      } else {
        const internalError = checkForInternalErrors(err);
        if (internalError === "TLE") {
          return "TLE"
        } else if (internalError === "Runtime Error: Buffer Exceeded") {
          return "TLE"
        } else {
          console.log(`Error while job execution: ${job.folder_name}, ${err.error}`);
          return "500"
        }
      }
    }
  });

  setKey(job.folder_name, JSON.stringify(await Promise.all(results)));
}

// *** Execute the generated file *** //
  // *** This output returns a promise :-
  //     It is only resolved on a successful and correct code exection.
  //     It is rejected in case there user submits an incorrect/buggy code.
  //     It is also rejected in case of any Internal Server Issue (Like python not installed) *** //
