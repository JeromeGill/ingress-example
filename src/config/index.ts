import { dataSource } from "./datasource";

const { NODE_ENV, PORT, REDIS_HOST, REDIS_PORT } = process.env;

export const config = {
  env: NODE_ENV ?? "",
  port: PORT ?? 0,
  database: dataSource,
  redis: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
  },
} as const;
