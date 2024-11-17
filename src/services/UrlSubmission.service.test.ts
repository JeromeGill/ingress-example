import { createSubmitUrlJob } from "../queues/UrlSubmission.queue";
import { dataSource } from "@/config/datasource";
import { submitUrl } from "./UrlSubmission.service";
import { URL_STATUS } from "@/consts";

// These unit tests are largely generated by github copilot
// At first it tried to mock the service itself which made me laugh
// I had to do the mocking myself
jest.mock("@/queues/UrlSubmission.queue", () => {
  return {
    createSubmitUrlJob: jest.fn(),
  };
});

jest.mock("@/config/datasource");
// jest.mock("./UrlSubmission.service", () => {
//   return {
//     getUrlSubmission: jest.fn(),
//     saveUrlSubmission: jest.fn(),
//     submitUrl: jest.fn(),
//   };
// });
describe("submitUrl", () => {
  const url = "http://example.com";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findOneBy: jest.fn(),
    };
    (dataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    jest.clearAllMocks();
  });

  it("should create a new UrlSubmission if none exists and submit it", async () => {
    mockRepository.findOneBy.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue({
      url,
      status: URL_STATUS.URL_RUNNING,
    });

    await submitUrl(url);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ url });
    expect(createSubmitUrlJob).toHaveBeenCalledWith(url);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        status: URL_STATUS.URL_RUNNING,
      }),
    );
  });

  it("should resubmit an existing UrlSubmission with status URL_PENDING", async () => {
    const urlSubmission = { url, status: URL_STATUS.URL_PENDING };
    mockRepository.findOneBy.mockResolvedValue(urlSubmission);
    mockRepository.save.mockResolvedValue({
      ...urlSubmission,
      status: URL_STATUS.URL_RUNNING,
    });

    await submitUrl(url);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ url });
    expect(createSubmitUrlJob).toHaveBeenCalledWith(url);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        url,
        status: URL_STATUS.URL_RUNNING,
      }),
    );
  });

  it("should not resubmit an existing UrlSubmission with status URL_RUNNING", async () => {
    const urlSubmission = { url, status: URL_STATUS.URL_RUNNING };
    mockRepository.findOneBy.mockResolvedValue(urlSubmission);

    await submitUrl(url);

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ url });
    expect(createSubmitUrlJob).not.toHaveBeenCalled();
  });
});
