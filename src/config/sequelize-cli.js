import dotenv from "dotenv";
dotenv.config();

const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: "postgres",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
};

export default {
  development: common,
  test: common,
  production: common,
};
