import fs from 'fs';

if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}

export const createFile = (job: any) => {
  if (fs.existsSync(`./temp/${job.folder_name}`)) {
    fs.rmSync(`./temp/${job.folder_name}`, { recursive: true });
  }
  fs.mkdirSync(`./temp/${job.folder_name}`, { recursive: true });
  fs.writeFileSync(`./temp/${job.folder_name}/Main.${job.language}`, job.code);
  fs.writeFileSync(`./temp/${job.folder_name}/input.txt`, job.input);
};

// export const 
