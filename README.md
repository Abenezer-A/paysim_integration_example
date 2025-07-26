# PaySim Integration Demo Store

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Made with Love](https://img.shields.io/badge/Made%20with-Love-ff69b4.svg?style=for-the-badge)](#)

This project is a simple but complete demonstration of how to integrate the **PaySim API** into a Node.js & Express web application. It serves as a practical, hands-on reference for implementing the entire payment lifecycle, from checkout initiation to secure webhook verification.

## 🚀 Live Demo Flow

Here's the user and system journey this project demonstrates:

1.  **🛒 Add to Cart**: A user visits our store and adds items to their shopping cart.
2.  **💳 Initiate Checkout**: The user clicks the "Checkout with PaySim" button.
3.  **🗣️ Server-to-Server Call**: Our Express server securely calls the PaySim `/api/payments/initiate` endpoint with an API key.
4.  **➡️ Redirect to PaySim**: The server receives a `checkoutUrl` and redirects the user's browser to the secure, hosted PaySim payment page.
5.  **✅ Customer Pays**: The user completes the payment on the PaySim page.
6.  **↩️ Redirect to Success Page**: PaySim redirects the user back to our store's `/order-complete` page.
7.  **🔍 Verify Payment**: Our server immediately calls the PaySim `/api/payments/verify/{paymentId}` endpoint to confirm the payment was successful before showing a success message.
8.  **🎣 Receive Webhook**: In the background, PaySim sends a `payment.succeeded` event to our `/webhook` endpoint. Our server verifies the HMAC signature to ensure it's a legitimate request and logs the fulfillment.

## ✨ Core Features

-   **Payment Initiation**: Securely creates a payment session from the server.
-   **Success URL Redirection**: Handles customers returning to the store after payment.
-   **Source-of-Truth Verification**: Implements the critical step of verifying payment status via the API.
-   **Secure Webhook Handling**: Includes a dedicated endpoint that performs cryptographic signature verification (`HMAC-SHA256`) to safely receive asynchronous updates.
-   **Idempotency**: Uses an `Idempotency-Key` to prevent duplicate payment initiations.
-   **Clean Frontend/Backend Separation**: A vanilla JS frontend that communicates with a dedicated Node.js backend.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Dependencies**: `dotenv`, `node-fetch@2`
-   **Development Tool**: `ngrok` for exposing the local server to receive webhooks.

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **Node.js and npm**: [Download Node.js](https://nodejs.org/en/download/) (v16 or newer recommended).
2.  **A PaySim Account**: You need access to the PaySim dashboard to get your API Key and Webhook Secret.
3.  **Ngrok**: A tool to create a secure public URL for your local server. [Sign up for free and install the CLI](https://dashboard.ngrok.com/get-started/setup).

---

## ⚙️ Setup and Running Instructions

Follow these steps to get the project running on your local machine.

### Step 1: Clone the Repository

```bash
git clone https://github.com/abenezer-a/paysim_integration_example.git
cd paysim_integration_example

Step 2: Install Dependencies
npm install

Step 3: Create Your Environment File

Edit .env file in the root of the project.

# .env

# Get this from your PaySim Project Dashboard
PAYSIM_API_KEY=ps_test_xxxxxxxxxxxxxxxxxxxxxxxx
# Create a webhook endpoint in the dashboard to get this secret
PAYSIM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
# This will be filled in the next step
PUBLIC_SERVER_URL=

Step 4: Start Ngrok

Because the PaySim server on the internet needs to send webhooks to your machine, you must expose your local server. Open a new terminal window and run the following command.

# This points ngrok to port 3000, where our app will run
ngrok http 3000

Ngrok will provide you with a public "Forwarding" URL. Copy the https URL. It will look something like https://<random-string>.ngrok-free.app.

Step 5: Update Environment File with Ngrok URL

Go back to your .env file and paste the https ngrok URL into the PUBLIC_SERVER_URL variable.

PUBLIC_SERVER_URL=https://<random-string>.ngrok-free.app

Step 6: Configure the Webhook in PaySim

Go to your PaySim project dashboard.

Navigate to the Webhooks section.

Create a new webhook endpoint.

For the Endpoint URL, paste your full ngrok URL with the /webhook path.

Example: https://<random-string>.ngrok-free.app/webhook

Ensure the webhook is subscribed to payment.succeeded and payment.failed events.

Save the webhook.

Step 7: Run the Server

You're all set! Go back to your first terminal window (in the project directory) and start the server.

node server.js

You should see the following output, confirming the server is running and using your public URL:

[Store Server] Online store is running at http://localhost:3000
[Store Server] Public URL for PaySim: https://<random-string>.ngrok-free.app

Step 8: Test the Flow!

Open your web browser and navigate to http://localhost:3000. You can now test the complete payment flow! Watch both the store server terminal and the ngrok terminal for live requests.

