import { Response, Request } from "express";

export type TRoute = {
  path: string;
  method: (req: IReq, res: IRes) => void;
};

// **** Express **** //
// Lifted from https://github.com/seanpmaxwell/express-generator-typescript/blob/master/lib/project-files/src/routes/common/types.ts

type TObj = Record<string, unknown>;
export type IReq = Request<TObj, void, TObj, TObj>;
export type IRes = Response<unknown, TObj>;

export type TUrlSubmissionState = {
  status: string;
  percentComplete: number;
};
