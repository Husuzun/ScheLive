const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User"); // Assuming your User model is in models/User.js

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Add a user for testing
    const testUser = new User({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpassword",
    });

    testUser
      .save()
      .then((user) => {
        console.log("User added:", user);
      })
      .catch((err) => {
        console.error("Error adding user:", err);
      });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello, Worasdsadld!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Create a new user
app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});
