require("dotenv").config();
require("express-async-errors");
const express = require("express");

const app = express();

// database
const connectDB = require("./db/connect");

// router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

// middleware
const errorMiddleWare = require("./middleware/error-handler");
const notFoundMiddleWare = require("./middleware/not-found");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const port = process.env.port || "5000";

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
  })
);

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json()); // for having access to the json data in req.body
app.use(cookieParser(process.env.JWT_SECRET)); // to access cookies coming back from the browser. Every time browser is going to be sending cookie with req

app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(notFoundMiddleWare);
app.use(errorMiddleWare);

const start = () => {
  try {
    connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server listening on ${port}...`));
  } catch (err) {
    console.log(err);
  }
};

start();
