const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
const dbName = "UKMG";

// Collections
const registrationCollection = "Registration";
const historyCollection = "history";
const hospitalDataCollection = "HospitalData";

// Serve Home Page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// User Registration
app.post('/register', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(registrationCollection);
        const { userID, name, dob, role } = req.body;

        const existingUser = await collection.findOne({ userID });
        if (existingUser) return res.json({ success: false, message: "User already registered" });

        await collection.insertOne({ userID, name, dob, role });
        res.json({ success: true, message: "Registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// User Login
app.post('/login', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(registrationCollection);
        const { userID } = req.body;

        const user = await collection.findOne({ userID });
        res.json(user ? { success: true, user } : { success: false, message: "User not found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch Medical History
app.get('/history/:userID', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(historyCollection);
        const userID = Number(req.params.userID);

        const history = await collection.findOne({ userID });
        res.json(history ? history : { message: "No history found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch Hospital Admin Data
app.get('/hospital-data', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(hospitalDataCollection);
        const data = await collection.findOne({ _id: "admin" });

        res.json(data ? data : { message: "No hospital data found" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ NHS Hospital Management System running on port ${PORT}`));
