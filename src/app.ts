import express from "express";
import bodyParser from "body-parser";
import { registerRoutes } from "./routes";
import { config } from "./config";
import { closeQueue } from "./queues/UrlSubmission.queue";
import { dataSource } from "./config/datasource";

export const app = async () => {
  const { port, env } = config;
  try {
    // Don't initialize the database in the test environment
    if (env === "development") {
      await dataSource.initialize();
    }
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  registerRoutes(app);

  app.on("close", () => {
    console.log("Closing the application");
    closeQueue();
  });

  return app.listen(port, () => {
    console.log(`Application is running on port ${port}.`);
  });
};
