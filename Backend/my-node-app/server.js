require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Allow frontend origin
    credentials: true, // Allow cookies to be sent
  })
);

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Basic Route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Google Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/"); // Redirect to home page on successful login
  }
);
app.get("/session", (req, res) => {
  res.send(req.session);
});

// Normal Login and Signup Routes

// Signup route for normal email/password users
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).send("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send("Error during signup.");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Cannot find user");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("Invalid credentials");
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      accessToken: accessToken,
      user: {
        name: user.name,
        email: user.email,
        tasks: user.tasks,
      },
    });
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).send("Server error during login.");
  }
});

// Logout Route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
app.get("/test-auth", (req, res) => {
  console.log("Full session object:", JSON.stringify(req.session, null, 2));
  console.log("Session ID:", req.sessionID);
  console.log("Is authenticated:", req.isAuthenticated());
  console.log("User in request:", req.user);
  console.log("Passport in session:", req.session.passport);
  if (req.isAuthenticated()) {
    res.json({ message: "You are authenticated", user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});
// Get all users (for testing purposes)
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// signup.js

//TASK PART
// Route to add a task
// Route to add a task
app.post("/addTask", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.tasks.length >= 5) {
      return res.status(400).send("Task limit reached.");
    }
    const { time, task } = req.body;
    user.tasks.push({ time, task });
    await user.save();
    res.status(200).send(user.tasks);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).send("Error adding task");
  }
});

// Route to get tasks for the logged-in user
app.get("/getTasks", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(user.tasks);
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).send("Error retrieving tasks");
  }
});
