require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Serve HTML files

// Connect to MongoDB
const mongoURI = process.env.MONGO_URL;
if (!mongoURI) {
    console.error("MONGO_URL is missing in environment variables!");
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Patient Schema
const patientSchema = new mongoose.Schema({
    userID: Number,
    name: String,
    age: Number,
    medicalHistory: String,
    registeredAt: { type: Date, default: Date.now },
});

const Patient = mongoose.model("Patient", patientSchema);

// API Routes

// Register a patient
app.post("/api/register", async (req, res) => {
    const { userID, name, age, medicalHistory } = req.body;

    if (!userID || !name || !age) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const existingPatient = await Patient.findOne({ userID });
    if (existingPatient) {
        return res.status(400).json({ error: "User already registered" });
    }

    const patient = new Patient({ userID, name, age, medicalHistory });
    await patient.save();
    res.status(201).json({ message: "Patient registered successfully" });
});

// Get patient record by userID
app.get("/api/profile/:userID", async (req, res) => {
    const { userID } = req.params;
    const patient = await Patient.findOne({ userID });

    if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
});

// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/records", (req, res) => res.sendFile(path.join(__dirname, "public", "records.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
