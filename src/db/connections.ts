import { Sequelize } from "sequelize";
import { logger } from "../logger/logger";

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const name = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;

export const sequelize = new Sequelize(
  `mysql://${user}:${pass}@${host}:${port}/${name}`,
  { ssl: true, logging: false }
);

export const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connection to DB successful');
  } catch (error) {
    logger.error(`Connection to DB failed, error: ${error}`);
    throw new Error('DB connection failed, please check the logs');
  }
};

export const dbClose = async () => {
  await sequelize.close();
};
