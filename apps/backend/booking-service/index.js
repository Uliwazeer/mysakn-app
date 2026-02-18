require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/booking-db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('BookingDB Connected'))
    .catch(err => console.error('BookingDB Error:', err));

// Kafka Setup
const kafka = new Kafka({
    clientId: 'booking-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});
const producer = kafka.producer();

const BookingSchema = new mongoose.Schema({
    userId: String,
    listingId: String,
    date: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', BookingSchema);

// Connect Producer
const runProducer = async () => {
    try {
        await producer.connect();
        console.log('Kafka Producer Connected');
    } catch (err) {
        console.error('Kafka Connection Error:', err);
        // Retry logic could go here
    }
};
runProducer();

app.post('/bookings', async (req, res) => {
    try {
        const { userId, listingId, date } = req.body;
        const booking = new Booking({ userId, listingId, date });
        await booking.save();

        // Send Event to Kafka
        try {
            await producer.send({
                topic: 'booking-events',
                messages: [
                    { value: JSON.stringify({ event: 'BOOKING_CREATED', booking }) }
                ],
            });
            console.log('Event Sent: BOOKING_CREATED');
        } catch (kafkaErr) {
            console.error('Kafka Send Error:', kafkaErr);
        }

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health', (req, res) => res.json({ status: 'Booking Service OK' }));

const PORT = 3003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
