const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const Event = require("./models/Event");
const User = require("./models/User");
app.use(cors());
app.use(express.json());
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User Registered ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.json({ message: "Wrong password ❌" });

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ message: "Login Success ✅", token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.json({ message: "Access Denied ❌" });

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch {
    res.json({ message: "Invalid Token ❌" });
  }
}

app.post("/add-event", auth, async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.json({ message: "Event added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/delete-event/:id", auth, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/update-event/:id", auth, async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Event updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// 🎟️ REGISTER FOR EVENT
app.post("/register-event/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.json({ message: "Event not found ❌" });

    // already registered check
    if (event.registeredUsers.includes(req.user.id)) {
      return res.json({ message: "Already Registered ⚠️" });
    }

    // capacity check
    if (event.registeredUsers.length >= event.capacity) {
      return res.json({ message: "Event Full ❌" });
    }

    event.registeredUsers.push(req.user.id);
    await event.save();

    res.json({ message: "Registered Successfully ✅" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
mongoose.connect("mongodb://127.0.0.1:27017/eventdb")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
