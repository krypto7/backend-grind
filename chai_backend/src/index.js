import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables before importing files that use process.env.
dotenv.config({ path: resolve(process.cwd(), ".env") });

const startServer = async () => {
  // Dynamic imports run after dotenv.config(), so app/db get the loaded env values.
  const { default: dbConnection } = await import("./db/index.js");
  const { default: app } = await import("./app.js");

  await dbConnection();

  app.listen(process.env.PORT, () =>
    console.log(`app running on ${process.env.PORT}`)
  );
};

startServer().catch((error) => {
  console.log("Error starting server:", error);
});
