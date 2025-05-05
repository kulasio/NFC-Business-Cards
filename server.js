const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 