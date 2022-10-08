require("dotenv").config();

// Database
require("./configs/mongoose.config");

// Debugger
require("./configs/debugger.config");

// App
const express = require("express");
const app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, 'Content-Type' : 'multipart/form-data' ,* "
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
// Configs
require("./configs/cors.config")(app);
require("./configs/middleware.config")(app);
require("./configs/passport.config")(app);

// Routes index
require("./routes")(app);

module.exports = app;
