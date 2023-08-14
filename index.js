const express = require("express");
const mongoose = require("mongoose");
const dbConfig = require("./config/db.config");
const cors = require("cors");
require("dotenv").config();

const auth = require("./middlewares/auth");
const errors = require("./middlewares/errors");

const { unless } = require("express-unless");

const app = express();

var whitelist = [
  "http://localhost:3000",
  "http://localhost:4000",
  "http://localhost:5000",
  "https://server.boomtrade.us",
];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET, PUT, POST, DELETE, OPTIONS",
  credentials: true,
};

app.use(cors(corsOptions));

mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database Connected");
    },
    (error) => {
      console.log("Database can't be connected: " + error);
    }
  );

auth.authenticateToken.unless = unless;

app.use(
  auth.authenticateToken.unless({
    path: [
      { url: "/users/login", methods: ["POST"] },
      { url: "/users/register", methods: ["POST"] },
      { url: "/users/deposit", methods: ["POST"] },
      { url: "/users/withdraw", methods: ["POST"] },
      { url: "/users/send-mail", methods: ["POST"] },
    ],
  })
);

app.use(express.json());

app.use("/users", require("./routes/user.routes"));

app.use(errors.errorHandler);

app.listen(process.env.port || 4000, function () {
  console.log("Ready To Go!");
});
