import { config } from "@/config";
import { TUrlSubmissionState } from "@/types";
import ioredis from "ioredis";

const redis = new ioredis(config.redis);

export const getUrlSubmissionState = async (
  url: string,
): Promise<TUrlSubmissionState | null> => {
  const state = await redis.get(url);
  return state ? JSON.parse(state) : null;
};

export const clearState = async (url: string) => {
  await redis.set(url, "");
};

export const setUrlSubmissionState = async (
  url: string,
  state: TUrlSubmissionState,
) => {
  await redis.set(url, JSON.stringify(state));
};

export const updateUrlSubmissionState = async (
  url: string,
  state: Partial<TUrlSubmissionState>,
) => {
  const currentState = await getUrlSubmissionState(url);
  await redis.set(url, JSON.stringify({ ...currentState, ...state }));
};
