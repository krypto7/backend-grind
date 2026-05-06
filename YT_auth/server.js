import config from "./config/Config.js";
import dbConnection from "./config/dbConnection.js";
import app from "./src/app.js";

dbConnection();

app.listen(config.PORT);
