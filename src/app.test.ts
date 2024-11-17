import request from "supertest";
import { Server } from "http";
import { app } from "./app";
import { SUBMIT_STATUS_PATH, SUBMIT_PATH, SUBMIT_CANCEL_PATH } from "@/consts";
import {
  submitUrl,
  getUrlSubmission,
  cancelUrl,
} from "@/services/UrlSubmission.service";
import { closeQueue } from "./queues/UrlSubmission.queue";

// app.test is an integration test. We connect to the server and make requests to it via http

// I'm mocking at the service layer here but this isn't what I'd do in a real project
// Mocking the service layer blurs the line between integration and unit tests
// Mocking the service layer is easier than mocking the db layer
// I don't want to set up a test database for this exercise so this will do
jest.mock("@/services/UrlSubmission.service", () => ({
  submitUrl: jest.fn(),
  cancelUrl: jest.fn(),
  getUrlSubmission: jest.fn(),
}));

// Suppress console.log for tests
jest.spyOn(console, "log").mockImplementation(() => {});

describe("Express Server", () => {
  let server: Server;

  beforeAll(async () => {
    server = await app();
  });

  afterAll((done) => {
    // the on close method is not being called in the test environment
    server.close(async () => {
      await closeQueue();
      done();
    });
    jest.clearAllMocks();
  });
  it("should respond with a 404 for an unknown route", async () => {
    const response = await request(server).get("/unknown-route");
    expect(response.status).toBe(404);
  });

  it("should respond with a 200 for the submit route", async () => {
    const response = await request(server)
      .post(SUBMIT_PATH.replace("$", ""))
      .send({ url: "www.example.com" });

    const mockUrlSubmission = {
      url: "www.example.com",
      status: "working",
    };

    (submitUrl as jest.Mock).mockResolvedValue(mockUrlSubmission);

    expect(response.status).toBe(200);
    expect(response.text).toBe("URL received: www.example.com");
  });

  it("should respond with a 200 for the status route", async () => {
    const testURL = encodeURI("www.example.com");
    const mockUrlSubmission = {
      url: testURL,
      status: "pending",
    };

    (getUrlSubmission as jest.Mock).mockResolvedValue(mockUrlSubmission);

    const path = SUBMIT_STATUS_PATH.replace(":url", testURL);
    const response = await request(server).get(path);

    expect(response.status).toBe(200);
    expect(response.text).toBe(
      `Url processing status: ${mockUrlSubmission.status}\n`,
    );
  });

  it("should respond with a 200 for the cancel route", async () => {
    const testURL = encodeURI("www.example.com");
    const mockUrlSubmission = {
      url: testURL,
      status: "pending",
    };

    (cancelUrl as jest.Mock).mockResolvedValue(mockUrlSubmission);

    const path = SUBMIT_CANCEL_PATH.replace(":url", testURL);
    const response = await request(server).put(path);

    expect(response.status).toBe(200);
    expect(response.text).toBe(
      `Url processing status: ${mockUrlSubmission.status}\n`,
    );
  });
});
