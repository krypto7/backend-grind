import app from "./src/app.js";
import config from "./src/config/config.js";
import dbConnection from "./src/config/dbConnection.js";

dbConnection();

app.listen(config.PORT, () => {
  console.log(`server runnnig on ${config.PORT}`);
});
