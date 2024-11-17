import {
  getUrlSubmission,
  saveUrlSubmission,
} from "@/services/UrlSubmission.service";
import { processCsvUrl } from "../utils/processCsvUrl";
import { URL_STATUS } from "@/consts";

// This is primary loop that streams the CSV and saves the records
export const submitUrlTask = async (props: { url: string }) => {
  const { url } = props; // The job payload
  const urlSubmission = await getUrlSubmission(url);

  if (!urlSubmission) {
    throw new Error(`URL not found: ${url}`);
  }

  urlSubmission.status = URL_STATUS.URL_RUNNING;
  await saveUrlSubmission(urlSubmission);
  try {
    await processCsvUrl(url);
    if (urlSubmission.status === URL_STATUS.URL_RUNNING) {
      urlSubmission.status = URL_STATUS.URL_FINISHED;
    }
  } catch (error) {
    console.error("Error processing submission", error);
    urlSubmission.status = URL_STATUS.URL_ERRORED;
    // This is a critical error, this would need careful handling in a real app
    throw error;
  } finally {
    await saveUrlSubmission(urlSubmission);
  }
  return `Processed URL ${url} with status ${urlSubmission.status}`;
};
