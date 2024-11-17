const dotenv = require("dotenv");
const path = require("path");

// Check the env
const NODE_ENV = process.env.NODE_ENV || "development";

// Configure "dotenv"
const environment = dotenv.config({
  path: path.join(__dirname, `./env/${NODE_ENV}.env`),
});

if (environment.error) {
  throw environment.error;
}
