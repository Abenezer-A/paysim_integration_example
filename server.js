// server.js

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// --- Configuration ---
const PAYSIM_API_URL = 'https://paysim-backend.onrender.com';
const PAYSIM_API_KEY = process.env.PAYSIM_API_KEY;
const PAYSIM_WEBHOOK_SECRET = process.env.PAYSIM_WEBHOOK_SECRET;
// **NEW**: Read the public URL from the environment file
const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL;

// A check to ensure the server doesn't start without critical keys
if (!PAYSIM_API_KEY || !PAYSIM_WEBHOOK_SECRET || !PUBLIC_SERVER_URL) {
    console.error("FATAL ERROR: Make sure PAYSIM_API_KEY, PAYSIM_WEBHOOK_SECRET, and PUBLIC_SERVER_URL are set in your .env file.");
    process.exit(1);
}

// --- Middleware ---
app.use(express.static('public')); 
app.use(express.json()); 

// --- Store API Routes (for the frontend to call) ---

app.post('/create-payment', async (req, res) => {
    console.log('\n[Store Server] Received request from frontend to create payment.');
    const { amount, currency, customerEmail } = req.body;

    try {
        const idempotencyKey = crypto.randomBytes(16).toString('hex');
        console.log(`[Store Server] Calling your PaySim API at ${PAYSIM_API_URL}/api/payments/initiate`);
        
        const apiResponse = await fetch(`${PAYSIM_API_URL}/api/payments/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': PAYSIM_API_KEY,
                'Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify({
                amount,
                currency,
                customerEmail,
                // **FIXED**: Use the public ngrok URL for the successUrl
                successUrl: `${PUBLIC_SERVER_URL}/order-complete` 
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error('[Store Server] Error from PaySim API:', data);
            throw new Error(data.msg || 'Failed to initiate payment.');
        }

        console.log('[Store Server] PaySim responded. Sending redirect URL to frontend.');
        res.json({ redirectUrl: data.checkoutUrl });

    } catch (error) {
        console.error('[Store Server] Error creating payment:', error);
        res.status(500).json({ error: error.message });
    }
});


// --- Store Pages (for user redirection) ---
// No changes needed here
app.get('/order-complete', async (req, res) => {
    const { paymentId } = req.query;
    if (!paymentId) {
        return res.status(400).send('<h1>Error: Missing Payment ID</h1><p>Please return to the store and try again.</p>');
    }
    console.log(`\n[Store Server] User returned to success URL for payment: ${paymentId}`);
    
    try {
        console.log(`[Store Server] Verifying payment ${paymentId} with your PaySim API...`);
        const apiResponse = await fetch(`${PAYSIM_API_URL}/api/payments/verify/${paymentId}`, {
            headers: { 'x-api-key': PAYSIM_API_KEY }
        });
        
        const verificationData = await apiResponse.json();

        if (!apiResponse.ok) {
            throw new Error(verificationData.msg || `API Error: ${apiResponse.statusText}`);
        }
        
        if (verificationData.status !== 'succeeded') {
            throw new Error(`Payment not successful. Current status: ${verificationData.status}`);
        }

        console.log('[Store Server] Verification successful!');
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>✅ Order Complete!</h1>
                <p>Thank you for your purchase. We have successfully verified your payment.</p>
                <p>Your Payment ID is: <strong>${verificationData.paymentId}</strong></p>
                <p>Amount: <strong>${verificationData.currency} ${verificationData.amount}</strong></p>
                <p>Status: <strong style="color: green;">${verificationData.status}</strong></p>
                <a href="/">Return to Store</a>
            </div>
        `);

    } catch (error) {
        console.error('[Store Server] Error on order complete page:', error);
        res.status(500).send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>❌ Payment Verification Failed</h1>
                <p>There was an issue verifying your payment. Please contact support.</p>
                <p style="color: red;">Details: ${error.message}</p>
                <a href="/">Return to Store</a>
            </div>
        `);
    }
});


// --- Webhook Endpoint (for the PaySim API to call) ---
// No changes needed here
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    console.log('\n[Store Server] Received a webhook from PaySim!');
    const signature = req.headers['x-paysim-signature'];
    const rawBody = req.body; 

    if (!signature) {
        console.warn('[Store Server] Webhook ignored. Missing signature.');
        return res.status(400).send('Missing signature.');
    }

    try {
        const expectedSignature = crypto
            .createHmac('sha256', PAYSIM_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');
        
        const isVerified = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

        if (!isVerified) {
            console.warn('[Store Server] Webhook verification failed: Invalid signature.');
            return res.status(400).send('Invalid signature.');
        }

        console.log('[Store Server] Webhook signature verified successfully.');
        
        const event = JSON.parse(rawBody.toString()); 
        
        switch (event.status) {
            case 'succeeded':
                console.log(`[Store Server] Webhook: Payment succeeded for ${event.paymentId}. Fulfilling order...`);
                break;
            case 'failed':
                console.log(`[Store Server] Webhook: Payment failed for ${event.paymentId}.`);
                break;
        }
        
        res.status(200).send('Received');

    } catch (error) {
        console.error('[Store Server] Error handling webhook:', error);
        res.status(400).send('Webhook error.');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`[Store Server] Online store is running at http://localhost:${port}`);
    console.log(`[Store Server] Public URL for PaySim: ${PUBLIC_SERVER_URL}`);
});
