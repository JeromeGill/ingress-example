import { dataSource } from "@/config/datasource";
import { URL_STATUS } from "@/consts";
import { UrlSubmission } from "@/models/UrlSubmission.entity";
import {
  cancelSubmitUrlJob,
  clearSubmitUrlJobState,
  createSubmitUrlJob,
} from "@/queues/UrlSubmission.queue";

export const getRepository = () => dataSource.getRepository(UrlSubmission);

export const saveUrlSubmission = async (urlSubmission: UrlSubmission) => {
  return await getRepository().save(urlSubmission);
};
export const getUrlSubmission = async (url: string) => {
  return await getRepository().findOneBy({
    url,
  });
};

export const submitUrl = async (url: string): Promise<UrlSubmission> => {
  let urlSubmission = await getUrlSubmission(url);
  if (!urlSubmission) {
    urlSubmission = new UrlSubmission();
    urlSubmission.url = url;
    urlSubmission.status = URL_STATUS.URL_PENDING;
  }

  // In a real app we might not want to resubmit completed URLs etc
  // but for this exercise we will just resubmit everything and clear the state
  if (urlSubmission.status !== URL_STATUS.URL_RUNNING) {
    urlSubmission.status = URL_STATUS.URL_RUNNING;
    await clearSubmitUrlJobState(url);
    await createSubmitUrlJob(url);
  }
  return await saveUrlSubmission(urlSubmission);
};

export const cancelUrl = async (url: string): Promise<UrlSubmission> => {
  let urlSubmission = await getUrlSubmission(url);
  if (!urlSubmission) {
    throw new Error(`URL not found: ${url}`);
  }

  await cancelSubmitUrlJob(url);

  urlSubmission.status = URL_STATUS.URL_CANCELLED;
  urlSubmission = await saveUrlSubmission(urlSubmission);
  return urlSubmission;
};
