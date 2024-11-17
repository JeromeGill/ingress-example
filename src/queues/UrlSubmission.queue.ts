import { Job, Queue, Worker } from "bullmq";
import { config } from "@/config";
import { QUEUE_NAME, QUEUE_TASKS, URL_STATUS, WORKER_COUNT } from "@/consts";
import { submitUrlTask } from "./tasks/submitUrlTask";
import { TripRecord } from "@/models/TripRecord.entity";
import { saveRecordsTask } from "./tasks/saveRecordsTask";
import {
  getUrlSubmissionState,
  updateUrlSubmissionState,
  clearState,
} from "./state/UrlSubmission.state";

const workerProcess = async (job: Job) => {
  const {
    name,
    data: { url, records },
  } = job;

  // Just exit if the URL has been cancelled but the job hasn't been removed yet
  // I forgot to pass the URL to the save jobs originally which had me stumped for a while
  if (await isUrlCancelled(url)) {
    return `Job ${name} cancelled for URL: ${url}`;
  }

  console.log(`Processing job ${name} for URL: ${url}`);

  switch (name) {
    case QUEUE_TASKS.SUBMIT_URL:
      return submitUrlTask({ url });
    case QUEUE_TASKS.SAVE_RECORDS:
      return saveRecordsTask({ records });
    default:
      return `Unknown task ${name}`;
  }
};

const workers: Worker[] = [];

// Lets create a few workers
for (let i = 0; i <= WORKER_COUNT; i++) {
  workers.push(
    new Worker(QUEUE_NAME, workerProcess, { connection: config.redis })
      .on("completed", (job) => {
        console.log(`Job ${job.id} completed with result ${job.returnvalue}`);
      })
      .on("failed", (job, err) => {
        console.error(`Job ${job.id} failed`, err);
      }),
  );
}

const queue = new Queue(QUEUE_NAME, {
  connection: config.redis,
});

export const createSubmitUrlJob = async (url: string) => {
  return await queue.add(QUEUE_TASKS.SUBMIT_URL, { url });
};

export const createSaveRecordsJob = async (url, records: TripRecord[]) => {
  return await queue.add(QUEUE_TASKS.SAVE_RECORDS, {
    url,
    records,
  });
};

export const clearSubmitUrlJobState = async (url: string) => {
  await clearState(url);
};

export const cancelSubmitUrlJob = async (url: string) => {
  await updateUrlSubmissionState(url, { status: URL_STATUS.URL_CANCELLED });
};

export const isUrlCancelled = async (url: string) => {
  const state = await getUrlSubmissionState(url);
  //   console.log("state", state);
  return state?.status === URL_STATUS.URL_CANCELLED;
};

export const closeQueue = async () => {
  for (const worker of workers) {
    await worker.close();
  }
  await queue.close();
};
