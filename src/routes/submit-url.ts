import { Request, Response } from "express";
import { TRoute } from "types";
import {
  getUrlSubmission,
  submitUrl,
  cancelUrl,
} from "@/services/UrlSubmission.service";
import { SUBMIT_CANCEL_PATH, SUBMIT_PATH, SUBMIT_STATUS_PATH } from "@/consts";
import { getUrlSubmissionState } from "@/queues/state/UrlSubmission.state";

const submitUrlController = async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send("URL is required");
  }
  await submitUrl(url);
  // Process the URL as needed
  res.status(200).send(`URL received: ${url}`);
};

const submitUrlStatusController = async (req: Request, res: Response) => {
  const { url } = req.params;
  const decodedUrl = decodeURIComponent(url);
  if (!url) {
    return res.status(400).send("URL is required");
  }

  const urlSubmission = await getUrlSubmission(decodedUrl);
  const { percentComplete } = await getUrlSubmissionState(decodedUrl);

  if (!urlSubmission) {
    return res.status(404).send(`URL not found: ${url}\n`);
  }

  const completedText = percentComplete ? ` ${percentComplete}% completed` : "";
  res
    .status(200)
    .send(`Url: ${url}  status: ${urlSubmission.status}.${completedText}\n`);
};

const submitUrlCancelController = async (req: Request, res: Response) => {
  const { url } = req.params;
  const decodedUrl = decodeURIComponent(url);
  if (!url) {
    return res.status(400).send("URL is required");
  }

  const urlSubmission = await cancelUrl(decodedUrl);

  if (!urlSubmission) {
    return res.status(404).send(`URL not found: ${url}\n`);
  }

  // Process the URL as needed
  res.status(200).send(`Url processing status: ${urlSubmission.status}\n`);
};

export const routes: TRoute[] = [
  {
    path: SUBMIT_PATH,
    method: submitUrlController,
  },
  {
    path: SUBMIT_STATUS_PATH,
    method: submitUrlStatusController,
  },
  {
    path: SUBMIT_CANCEL_PATH,
    method: submitUrlCancelController,
  },
];
