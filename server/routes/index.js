module.exports = (app) => {
  app.use("/api/comments", require("./comments.routes.js"));
  app.use("/api/attention", require("./attention.routes.js"));
  app.use("/api/marks", require("./marks.routes"));
  app.use("/api/courses", require("./courses.routes.js"));
  app.use("/api/teachers", require("./teachers.routes.js"));
  app.use("/api/users", require("./users.routes.js"));
  app.use("/api/files", require("./files.routes.js"));
  app.use("/api", require("./auth.routes.js"));
};

