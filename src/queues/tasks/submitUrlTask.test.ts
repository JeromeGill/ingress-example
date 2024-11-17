import { submitUrlTask } from "./submitUrlTask";
import {
  getUrlSubmission,
  saveUrlSubmission,
} from "@/services/UrlSubmission.service";
import { processCsvUrl } from "../utils/processCsvUrl";
import { URL_STATUS } from "@/consts";

jest.mock("@/services/UrlSubmission.service");
// I should use jests default mocking for these really
// Prevents open handles by wiping the module
jest.mock("@/queues/UrlSubmission.queue", () => ({}));
jest.mock("../state/UrlSubmission.state", () => ({}));

jest.mock("../utils/processCsvUrl");

describe("submitUrlTask", () => {
  const url = "http://example.com";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if URL submission is not found", async () => {
    (getUrlSubmission as jest.Mock).mockResolvedValue(null);

    await expect(submitUrlTask({ url })).rejects.toThrow(
      `URL not found: ${url}`,
    );

    expect(getUrlSubmission).toHaveBeenCalledWith(url);
    expect(saveUrlSubmission).not.toHaveBeenCalled();
    expect(processCsvUrl).not.toHaveBeenCalled();
  });

  it("should process the URL submission successfully", async () => {
    const urlSubmission = { url, status: URL_STATUS.URL_PENDING };
    (getUrlSubmission as jest.Mock).mockResolvedValue(urlSubmission);
    (processCsvUrl as jest.Mock).mockResolvedValue(undefined);

    const result = await submitUrlTask({ url });

    expect(getUrlSubmission).toHaveBeenCalledWith(url);
    expect(processCsvUrl).toHaveBeenCalledWith(url);
    expect(result).toBe(
      `Processed URL ${url} with status ${URL_STATUS.URL_FINISHED}`,
    );
  });

  it("should handle errors during URL submission processing", async () => {
    const urlSubmission = { url, status: URL_STATUS.URL_PENDING };
    (getUrlSubmission as jest.Mock).mockResolvedValue(urlSubmission);

    // I don't want to print errors to the console in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Processing error");
    (processCsvUrl as jest.Mock).mockRejectedValue(error);

    await expect(submitUrlTask({ url })).rejects.toThrow(error);

    expect(saveUrlSubmission).toHaveBeenCalledWith({
      ...urlSubmission,
      status: URL_STATUS.URL_ERRORED,
    });
  });
});
