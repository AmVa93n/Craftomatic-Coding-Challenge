const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middleware configuration

module.exports = (app) => {
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: [process.env.ORIGIN || "http://localhost:5173"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
};