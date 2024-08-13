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

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Allow frontend origin
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Express session middleware
app.use(
  session({
    secret: "123", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Initialize Passport and use session
app.use(passport.initialize());
app.use(passport.session());

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

// Passport Local Strategy (for normal login)
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Use 'email' as the username field
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Client ID
      clientSecret: "YOUR_GOOGLE_CLIENT_SECRET", // Replace with your Google Client Secret
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user.id); // Store user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log("Deserializing user:", user);
    done(null, user);
  } catch (err) {
    console.error("Deserialization error:", err);
    done(err);
  }
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

// Login route for normal email/password users
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error in passport.authenticate:", err);
      return next(err);
    }
    if (!user) {
      console.log("Authentication failed, user not found");
      return res.status(401).send("Login failed");
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error in req.logIn:", err);
        return next(err);
      }
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return next(err);
        }
        console.log("User after login:", user);
        return res.send("Login successful");
      });
    });
  })(req, res, next);
});
// Logout Route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
app.get("/test-auth", (req, res) => {
  console.log("Session in test-auth:", req.session);
  console.log("User in test-auth:", req.user);
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
app.post("/addTask", async (req, res) => {
  console.log("Authenticated:", req.isAuthenticated()); // Should be true
  console.log("User in addTask:", req.user); // Debugging line to check if user is populated
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  const { time, task } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (user.tasks.length >= 5) {
      return res.status(400).send("Task limit reached.");
    }
    user.tasks.push({ time, task });
    await user.save();
    res.status(200).send(user.tasks);
  } catch (error) {
    res.status(500).send("Error adding task");
  }
});

// Route to get tasks for the logged-in user
app.get("/getTasks", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const user = await User.findById(req.user.id);
    res.status(200).send(user.tasks);
  } catch (error) {
    res.status(500).send("Error retrieving tasks");
  }
});
