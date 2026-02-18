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
app.get('/', (req, res) => res.json({ message: "Notification Service is running", health: "/health" }));

app.get('/health', (req, res) => res.json({ status: 'Notification Service OK' }));

const PORT = 3004;
app.listen(PORT, () => console.log(`Notification Service (API) running on port ${PORT}`));

const run = async () => {
    try {
        await consumer.connect();
        console.log('Kafka Consumer Connected');

        await consumer.subscribe({ topic: 'booking-events', fromBeginning: true });
        await consumer.subscribe({ topic: 'auth-events', fromBeginning: true });

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
                    } else if (data.event === 'USER_REGISTERED') {
                        const { user } = data;
                        if (user.verificationMethod === 'email') {
                            console.log(`📧 [NOTIFICATION] Sending verification EMAIL to ${user.email}`);
                            console.log(`💬 Code: ${user.verificationCode}`);
                        } else {
                            console.log(`📱 [NOTIFICATION] Sending verification SMS to ${user.phone}`);
                            console.log(`💬 Code: ${user.verificationCode}`);
                        }
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log('✅ Verification Message "Sent"');
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
