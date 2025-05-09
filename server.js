const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db();
        console.log('Connected to MongoDB Atlas');
    }
    return db;
}

// Serve static files from the public directory
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the schedule page
app.get('/schedule.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'schedule.html'));
});

app.use(express.json());

app.post('/api/track-tap', async (req, res) => {
    try {
        const db = await connectDB();
        const tapData = {
            timestamp: new Date(),
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            ...req.body
        };
        await db.collection('taps').insertOne(tapData);
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error tracking tap:', err);
        res.status(500).json({ success: false, error: 'Failed to track tap' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 