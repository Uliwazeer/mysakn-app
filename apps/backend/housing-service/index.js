require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/housing-db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('HousingDB Connected'))
    .catch(err => console.error('HousingDB Error:', err));

const ListingSchema = new mongoose.Schema({
    title: String,
    price: Number,
    location: String,
    type: String,
    ownerId: String,
    amenities: [String],
    createdAt: { type: Date, default: Date.now }
});

const Listing = mongoose.model('Listing', ListingSchema);

// CRUD Routes
app.get('/listings', async (req, res) => {
    try {
        const { location, type, minPrice, maxPrice } = req.query;
        let query = {};
        if (location) query.location = new RegExp(location, 'i');
        if (type) query.type = type;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }
        const listings = await Listing.find(query).sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/listings', async (req, res) => {
    try {
        const listing = new Listing(req.body);
        await listing.save();
        res.status(201).json(listing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/listings/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: 'Not found' });
        res.json(listing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => res.json({ message: "Housing Service is running", health: "/health" }));

app.get('/health', (req, res) => res.json({ status: 'Housing Service OK' }));

const PORT = 3002;
app.listen(PORT, () => console.log(`Housing Service running on port ${PORT}`));
