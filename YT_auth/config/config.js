import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error("MONGODB_URL is not defined");
}

const config = {
  MONGODB_URL: process.env.MONGODB_URL,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.PORT,
};

export default config;
