import { DataSource } from "typeorm";

// https://orkhan.gitbook.io/typeorm/docs/data-source
export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_NAME,
  password: process.env.POSTGRES_PASSWORD,
  entities: ["src/**/*.entity.{js,ts}"],
  username: process.env.POSTGRES_USER,
  port: parseInt(process.env.POSTGRES_PORT),
  migrations: ["src/**/migrations/*{.ts,.js}"],
  migrationsTableName: "migrations",
});
