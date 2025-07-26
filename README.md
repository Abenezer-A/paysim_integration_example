# 🛍️ PaySim Integration Demo Store

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Made with Love](https://img.shields.io/badge/Made%20with-Love-ff69b4.svg?style=for-the-badge)](#)

A complete Node.js + Express integration example for the **PaySim API**. This project walks through the full payment lifecycle—from cart to webhook—designed for developers seeking a real-world payment integration example.

---

## 🚀 Live Demo Flow

Here’s how the flow works:

1. **🛒 Add to Cart**: User adds items to their cart.
2. **💳 Checkout**: User clicks "Checkout with PaySim".
3. **🗣️ Backend Request**: Express server securely calls `POST /api/payments/initiate` with your API key.
4. **➡️ Redirect to PaySim**: Receives `checkoutUrl` → redirects user to PaySim.
5. **✅ Payment**: User completes payment on PaySim.
6. **↩️ Return to Store**: User is redirected to `/order-complete`.
7. **🔍 Verify Payment**: Server calls `GET /api/payments/verify/{paymentId}` to confirm payment.
8. **🎣 Webhook Notification**: PaySim sends `payment.succeeded` to `/webhook`. Server validates via HMAC-SHA256.

---

## ✨ Core Features

- **🔐 Secure Payment Initiation**
- **🔁 Success URL Redirection**
- **🧾 Verified Payment Status**
- **🪝 Secure Webhook Verification**
- **🆔 Idempotency-Key Support**
- **🎨 Clean Frontend & Backend Separation**

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Dependencies**: `dotenv`, `node-fetch@2`
- **Dev Tooling**: [Ngrok](https://ngrok.com) for exposing local webhooks

---

## 📋 Prerequisites

Before starting:

- ✅ [Node.js](https://nodejs.org/en/download/) (v16 or newer)
- ✅ PaySim account (to get your API Key and Webhook Secret)
- ✅ [Ngrok account](https://dashboard.ngrok.com/get-started/setup)

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/abenezer-a/paysim_integration_example.git
cd paysim_integration_example
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env` File

Create a `.env` file in the project root:

```env
# .env

# From PaySim Dashboard
PAYSIM_API_KEY=ps_test_xxxxxxxxxxxxxxxxxxxxxxxx

# From Webhook settings in dashboard
PAYSIM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Will be filled after ngrok setup
PUBLIC_SERVER_URL=
```

---

### 4. Start Ngrok

Expose your local server using ngrok:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL provided by ngrok (e.g., `https://abc123.ngrok-free.app`).

### 5. Update `.env` with Ngrok URL

```env
PUBLIC_SERVER_URL=https://abc123.ngrok-free.app
```

---

### 6. Configure Webhook in PaySim

- Go to PaySim Dashboard → **Webhooks**
- Create a new webhook endpoint:
  - **URL**: `https://abc123.ngrok-free.app/webhook`
  - Subscribe to `payment.succeeded` and `payment.failed`
- Save it.

---

### 7. Run the Server

```bash
node server.js
```

Expected output:

```bash
[Store Server] Online store is running at http://localhost:3000
[Store Server] Public URL for PaySim: https://abc123.ngrok-free.app
```

---

### 8. Test the Payment Flow!

Visit [http://localhost:3000](http://localhost:3000) in your browser. Walk through the store and test a complete transaction. Watch the server terminal and ngrok logs for real-time feedback.

---

## 📄 License

This project is provided for demo and educational purposes only. No warranty or liability implied.
