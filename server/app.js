require("dotenv").config();
const express = require("express");
const app = express();

require("./config")(app);

const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("./jwt.middleware");
const { db } = require("./config/jsondb.config");

app.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Check the database if a user with the provided credentials exists
        const users = await db.getData('/users');
        const foundUser = users.find((user) => user.email === email && user.password === password);
            
        if (!foundUser) {
          // If the user is not found, send an error response
          res.status(401).json({ message: "Unauthorized: Invalid username or password. Please try again." });
          return;
        }

        // Create an object that will be set as the token payload, ommitting the password
        const payload = {...foundUser, password: undefined};

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "7d",
        });

        // Send the token as the response
        res.status(200).json({ authToken });
        
      } catch (err) {
        next(err); // send to the error handling middleware
      }
});

app.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid, the payload gets decoded by the isAuthenticated middleware and is available on `req.payload`
  res.status(200).json(req.payload); // Send back the token payload object containing the user data
});

require("./error-handling")(app);

module.exports = app;