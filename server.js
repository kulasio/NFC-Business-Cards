const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const nodemailer = require('nodemailer');
const multer = require('multer');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'nfc_taps';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// MongoDB connection handling
let cachedDb = null;

async function connectDB() {
    if (cachedDb) {
        return cachedDb;
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    cachedDb = db;
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
        const { location, ...rest } = req.body;
        const tapData = {
            timestamp: new Date(),
            userAgent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            action: req.body.action,
            ...rest
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

const upload = multer();

// Upload image endpoint
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        const db = await connectDB();
        const imageDoc = {
            name: req.body.name || 'Untitled',
            img: req.file.buffer, // Store image as Buffer
            contentType: req.file.mimetype
        };
        const result = await db.collection('images').insertOne(imageDoc);
        res.status(201).json({ success: true, id: result.insertedId });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
});

app.get('/api/image/:id', async (req, res) => {
    try {
        const db = await connectDB();
        const image = await db.collection('images').findOne({ _id: new ObjectId(req.params.id) });
        if (!image) return res.status(404).send('Image not found');
        res.set('Content-Type', image.contentType);
        res.end(image.img.buffer, 'binary');
    } catch (err) {
        res.status(500).send('Error retrieving image');
    }
});

app.get('/api/image-by-name/:name', async (req, res) => {
    try {
        const db = await connectDB();
        const image = await db.collection('images').find({ name: req.params.name }).sort({ _id: -1 }).limit(1).toArray();
        if (image.length === 0) return res.status(404).json({ error: 'Image not found' });
        res.json({ id: image[0]._id });
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving image by name' });
    }
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

module.exports = app; 