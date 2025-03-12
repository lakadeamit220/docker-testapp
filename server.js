const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 5050;
const MONGO_URL = "mongodb://root:root@localhost:27017";
const DB_NAME = "dockerMongo-db";

let db;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB once
(async () => {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        console.log("Connected successfully to MongoDB");
        db = client.db(DB_NAME);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit if the connection fails
    }
})();

// Serve the HTML form at `/addUser`
app.get("/addUser", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET all users
app.get("/getUsers", async (req, res) => {
    try {
        const users = await db.collection("users").find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
});

// POST new user
app.post("/addUser", async (req, res) => {
    try {
        const userObj = req.body;
        const result = await db.collection("users").insertOne(userObj);
        res.status(201).json({ message: "User added successfully", id: result.insertedId });
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Error adding user");
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
