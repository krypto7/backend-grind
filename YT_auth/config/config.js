import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error("MONGO_URL is not defined in environment variable");
}

const config = {
  MONGODB_URL: `${process.env.MONGODB_URL}/YT_auth`,
  JWT_SECRET: "1223",
};

export default config;
