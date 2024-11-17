// Paths

export const SUBMIT_PATH = "/submit-url$";
export const SUBMIT_STATUS_PATH = "/submit-url/status/:url";
export const SUBMIT_CANCEL_PATH = "/submit-url/cancel/:url";

export const QUEUE_NAME = "UrlSubmission.queue";

export const QUEUE_TASKS = {
  SUBMIT_URL: "submitUrl",
  SAVE_RECORDS: "saveRecords",
};

export const URL_STATUS = {
  URL_PENDING: "PENDING",
  URL_RUNNING: "RUNNING",
  URL_ERRORED: "ERRORED",
  URL_FINISHED: "FINISHED",
  URL_CANCELLED: "CANCELLED",
};

// Number of redis workers to use
// One will be processing a URL, the others will be saving records
export const WORKER_COUNT = 4;

// The batch size is the number of records to send to a single save record job in the queue
export const SAVE_RECORD_BATCH_SIZE = 10000;

// The chunk size is the number of records job will persist in a single database transaction
export const TRIP_RECORD_PERSIST_CHUNK_SIZE = 2000;

// How much of the csv to download before closing the connection
// mostly for testing
// null to download the whole file
// export const MAX_FILE_SIZE = 1024 * 1024 * 100; // 100MB
export const MAX_FILE_SIZE = null; // 100MB
