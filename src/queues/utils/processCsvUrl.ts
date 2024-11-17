import { createSaveRecordsJob, isUrlCancelled } from "../UrlSubmission.queue";
import { TripRecord } from "@/models/TripRecord.entity";
import { SAVE_RECORD_BATCH_SIZE } from "@/consts";
import { csvStream } from "../utils/csvStream";
import { updateUrlSubmissionState } from "../state/UrlSubmission.state";

export const processCsvUrl = async (url: string) => {
  // Keep a buffer of records to save in batches
  let tripRecords: TripRecord[] = [];

  // https://developer.mozilla.org/en-US/docs/Web/API/AbortController
  const controller = new AbortController();
  const { signal } = controller;

  // Clear the buffer and save the records
  // These will need to be sent to another worker process so we don't get blocked
  // The lock prevents us from spawning many processes while awaiting successful creation of a job
  let lock = false;
  const clearTripRecords = async (percentComplete?: number) => {
    if (lock) {
      return;
    }

    lock = true;
    // Check redis state to see if we have a cancel status for this URL
    if (await isUrlCancelled(url)) {
      // If so, the abort signal cancels the download stream
      controller.abort();
    }
    // Let's not create jobs if we've got an abort signal or no records
    // The length check is unnecessary but can't hurt
    if (tripRecords.length > 0 && !signal.aborted) {
      await createSaveRecordsJob(url, tripRecords);
      await updateUrlSubmissionState(url, { percentComplete });
      tripRecords = [];
    }
    lock = false;
  };

  const processRow = async (row: unknown, percentComplete: number) => {
    const tripRecord = TripRecord.fromObject(row);
    tripRecords.push(tripRecord);

    if (tripRecords.length >= SAVE_RECORD_BATCH_SIZE) {
      await clearTripRecords(percentComplete);
    }
  };

  await csvStream(url, processRow);
  await clearTripRecords();
};
