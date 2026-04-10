const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const dataFilePath = path.join(__dirname, 'trips.json');

if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ trips: [] }, null, 2));
}

const readTrips = () => {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data).trips;
};

const writeTrips = (trips) => {
    fs.writeFileSync(dataFilePath, JSON.stringify({ trips }, null, 2));
};

app.get('/api/trips', (req, res) => {
    const trips = readTrips();
    res.json({ success: true, data: trips });
});

app.get('/api/trips/:id', (req, res) => {
    const trips = readTrips();
    const trip = trips.find(t => t.id === parseInt(req.params.id));
    if (!trip) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: trip });
});

app.post('/api/trips', (req, res) => {
    const { destination, startDate, endDate, budget, activities } = req.body;
    if (!destination || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const trips = readTrips();
    const newTrip = { id: Date.now(), destination, startDate, endDate, budget: budget || 0, activities: activities || [] };
    trips.push(newTrip);
    writeTrips(trips);
    res.status(201).json({ success: true, data: newTrip });
});

app.put('/api/trips/:id', (req, res) => {
    const trips = readTrips();
    const index = trips.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Not found' });
    const { destination, startDate, endDate, budget, activities } = req.body;
    trips[index] = { ...trips[index], destination: destination || trips[index].destination, startDate: startDate || trips[index].startDate, endDate: endDate || trips[index].endDate, budget: budget !== undefined ? budget : trips[index].budget, activities: activities || trips[index].activities };
    writeTrips(trips);
    res.json({ success: true, data: trips[index] });
});

app.delete('/api/trips/:id', (req, res) => {
    const trips = readTrips();
    const filtered = trips.filter(t => t.id !== parseInt(req.params.id));
    if (trips.length === filtered.length) return res.status(404).json({ success: false, message: 'Not found' });
    writeTrips(filtered);
    res.json({ success: true, message: 'Deleted' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));