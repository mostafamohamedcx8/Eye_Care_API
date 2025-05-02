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
<<<<<<< HEAD
const patientroute = require("./routes/patientRoute");
const reportroute = require("./routes/reportRoute");
const cors = require("cors");
=======
const doctorUpload = require("./routes/doctorPhotosRoutes");
>>>>>>> f5a6b9ffd2c4461a60ce751933a07ebbc840d78d

// connection with db
dbconnection();

// express app
const app = express();

// middlewares
app.use(express.json());

app.use(cors());

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
<<<<<<< HEAD
app.use("/api/v1/patient", patientroute);
app.use("/api/v1/report", reportroute);
=======
app.use("/api/v1/doctor", doctorUpload);
>>>>>>> f5a6b9ffd2c4461a60ce751933a07ebbc840d78d

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
