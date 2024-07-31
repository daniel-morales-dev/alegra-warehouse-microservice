require("dotenv").config();
import { DataSource } from "typeorm";
import { resolve } from "path";
import Container from "typedi";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: String(process.env.DATABASE_PASSWORD || "") + "",
  database: process.env.DATABASE_NAME,
  entities: [resolve("src/models/*{.ts,.js}")],
  migrations: [resolve("src/migrations/*{.ts,.js}")],
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
});

Container.set(DataSource, AppDataSource);
