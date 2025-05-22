const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

const dbName = process.env.DB_NAME || 'nfc_taps';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
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

app.post('/api/send-meeting-request', async (req, res) => {
    const { name, email, phone, meetingType, preferredDate, preferredTime, purpose } = req.body;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'nikko.mission099@gmail.com',
        subject: 'New Meeting Request',
        text: `You have a new meeting request:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMeeting Type: ${meetingType}\nPreferred Date: ${preferredDate}\nPreferred Time: ${preferredTime}\nPurpose: ${purpose}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Request sent!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 