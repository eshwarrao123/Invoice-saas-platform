# 📄 Invoice SaaS Platform

A full-stack SaaS-based Invoice Management and Payment Reminder application built using the MERN stack.  
This project allows users to create, manage, send, and collect payments for invoices with subscription-based feature control.

---

## 🚀 Live Demo

- 🌐 Frontend (Vercel): https://invoice-saas-platform.vercel.app  
- 🔗 Backend (Render): https://invoice-api-lwvw.onrender.com  

---

## 🧠 Project Overview

This application simulates a production-ready SaaS invoicing platform where users can:

- Register and login securely using JWT authentication
- Manage clients
- Create and manage invoices
- Send invoices via Email (SendGrid)
- Send SMS reminders (Twilio)
- Accept online payments (Stripe Checkout)
- Upgrade to Pro subscription for unlimited invoice creation

The system includes production-level deployment, API security, subscription logic, and third-party service integrations.

---

## 🏗 Architecture

User → Vercel (React Frontend)  
  ↓  
Render (Node.js + Express Backend API)  
  ↓  
MongoDB Atlas (Cloud Database)  
  ↓  
Stripe | SendGrid | Twilio  

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router
- Context API
- JWT Authentication
- SPA Routing (Vercel rewrites)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt Password Hashing
- Stripe Checkout & Webhooks
- SendGrid Email API
- Twilio SMS API
- Helmet & CORS Security

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 🔐 Authentication & Security

- JWT-based authentication
- Password hashing using bcrypt
- Protected routes with middleware
- Axios interceptors for automatic token attachment
- Environment variable configuration
- Subscription-based feature restriction (Free vs Pro)

---

## 💳 Subscription Model

### Free Plan
- Limited to 10 invoices per day

### Pro Plan
- Unlimited invoice creation
- Stripe subscription integration
- Webhook-based subscription updates

---

## 📧 Email & SMS Features

- Send invoice emails using SendGrid
- Plain text + HTML email formatting
- SMS invoice reminders using Twilio
- Production-ready structure for domain authentication (SPF/DKIM ready)

---

## 📦 API Endpoints (Sample)

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/user`

### Clients
- `GET /api/clients`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

### Invoices
- `GET /api/invoices`
- `POST /api/invoices`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `POST /api/invoices/:id/send`
- `POST /api/invoices/:id/pay`

### Subscription
- `POST /api/subscription/create-checkout-session`
- `POST /api/subscription/webhook`

---

## 🧪 Running Locally


```bash
Clone Repository :

git clone <https://github.com/eshwarrao123/Invoice-saas-platform>
cd invoice-app

---

Backend Setup :

cd server
npm install
npm run dev

Frontend Setup :

cd client
npm install
npm run dev
