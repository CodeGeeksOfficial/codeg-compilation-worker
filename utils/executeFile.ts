import { exec } from "child_process"; //TODO: use spawn

// *** Execute the generated Python file *** //

const getExecutionCommand = (job: any) => {
  if (job.language === "py") {
    return `sudo -u executionuser python3 ./temp/${job.folder_name}/Main.py < ./temp/${job.folder_name}/input.txt`
  } else if (job.language === "cpp") {
    return `g++ ./temp/${job.folder_name}/Main.cpp -o ./temp/${job.folder_name}/a && sudo -u executionuser "./temp/${job.folder_name}/a" < ./temp/${job.folder_name}/input.txt`
  } else if (job.language === "java") {
    return `sudo -u executionuser java ./temp/${job.folder_name}/Main.java < ./temp/${job.folder_name}/input.txt`
  } else if (job.language === "js") {
    return `sudo -u executionuser node ./temp/${job.folder_name}/Main.js < ./temp/${job.folder_name}/input.txt`
  } else {
    return "echo Language Not Supported"
  }
}

const executeFile = (job: any) => {
  return new Promise((resolve, reject) => {
    exec(
      getExecutionCommand(job),
      { timeout: job.timeout },
      (error, stdout, stderr) => {
        if (stderr) {
          reject({ stderr, stdout });
        }
        if (error) {
          reject({ error });
        }
        resolve({ stderr, stdout });
      }
    );
  });
};

export default executeFile;
