# Kafka UI Interaction Guide

This guide explains how to use the deployed Kafka UI to manually trigger events in your microservices application and verify the results.

## 1. Access Kafka UI
Open your browser and navigate to the Kafka UI URL provided at the end of the deployment script (usually `http://<MINIKUBE_IP>:30090`).

## 2. Trigger a Booking Notification
We will manually simulate a "Booking Created" event to see if the **Notification Service** picks it up.

### Step-by-Step:
1.  In Kafka UI, go to **Topics** in the sidebar.
2.  Click on the `booking-events` topic.
3.  Click the **Produce Message** button (top right).
4.  In the **Value** field, paste the following JSON payload:
    ```json
    {
      "event": "BOOKING_CREATED",
      "booking": {
        "userId": "manual-test-user",
        "listingId": "apartment-101",
        "date": "2024-01-01"
      }
    }
    ```
5.  Click **Produce Message**.

## 3. Verify the Effect
Check the logs of the **Notification Service** to see if it processed the message.

Run this command in your terminal:
```bash
kubectl logs -l app=notification-service -n mysakn-app -f
```

### Expected Output:
You should see logs similar to:
```text
Kafka Consumer Connected
- booking-events[0 | 5] / 1708176543210 {"event":"BOOKING_CREATED",...}
📧 Sending Email Notification to User: manual-test-user for Listing: apartment-101
✅ Email Sent Successfully
```

This confirms that:
1.  **Kafka** is correctly routing messages.
2.  **Notification Service** is successfully consuming messages from the `booking-events` topic.
