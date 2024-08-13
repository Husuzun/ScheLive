const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  time: String, // e.g., "8 AM", "9 AM"
  task: String, // The task description
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tasks: {
    type: [taskSchema],
    default: [],
  }, // Embed the task schema in the user schema
});

const User = mongoose.model("User", userSchema);

module.exports = User;
