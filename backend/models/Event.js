const mongoose = require("mongoose");  // ✅ MUST ADD
const eventSchema = new mongoose.Schema({
  eventName: String,
  date: String,
  time: String,
  venue: String,
  category: String,
  description: String,
  capacity: Number,
  price: Number,
  image: String,
  registeredUsers: [String]
});
module.exports = mongoose.model("Event", eventSchema);