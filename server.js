const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const dbconnection = require("./config/database");
const GlobalError = require("./middleware/errorMiddleware");
dotenv.config({ path: "config.env" });
const ApiError = require("./utils/ApiError");
const eyeexaminationroute = require("./routes/EyeExaminationroute");
const Userroute = require("./routes/UserRoute");
const authroute = require("./routes/AuthRoute");
const doctorUpload = require("./routes/doctorPhotosRoutes");

// connection with db
dbconnection();

// express app
const app = express();

// middlewares
app.use(express.json());

// const server = app.listen(PORT, () => {
//   console.log(`App running on ${PORT}`);
// });
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
//Global error handling middleware

app.use("/api/v1/examination", eyeexaminationroute);
app.use("/api/v1/user", Userroute);
app.use("/api/v1/auth", authroute);
app.use("/api/v1/doctor", doctorUpload);

// app.all("*", (req, res, next) => {
//   next(new ApiError(`can't find thos route: ${req.originalUrl}`, 400));
// });

app.use(GlobalError);
const { PORT } = process.env;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});

// Handel rejection error outside exprees
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
