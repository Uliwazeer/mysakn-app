require('dotenv').config();
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

const express = require('express');
const app = express();
app.use(express.json());

// Routes
app.get('/health', (req, res) => res.json({ status: 'Notification Service OK' }));

const PORT = 3004;
app.listen(PORT, () => console.log(`Notification Service (API) running on port ${PORT}`));

const run = async () => {
    try {
        await consumer.connect();
        console.log('Kafka Consumer Connected');

        await consumer.subscribe({ topic: 'booking-events', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
                const payload = message.value.toString();
                console.log(`- ${prefix} ${payload}`);

                try {
                    const data = JSON.parse(payload);
                    if (data.event === 'BOOKING_CREATED') {
                        console.log(`📧 Sending Email Notification to User: ${data.booking.userId} for Listing: ${data.booking.listingId}`);
                        // Simulate email sending delay
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log('✅ Email Sent Successfully');
                    }
                } catch (e) {
                    console.error('Error processing message:', e);
                }
            },
        });
    } catch (err) {
        console.error('Kafka Consumer Error:', err);
    }
};

run().catch(console.error);
