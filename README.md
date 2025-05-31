# Bitespeed Identity Reconciliation API

A TypeScript-based backend service for Bitespeed's Identity Reconciliation assessment. This service identifies and consolidates user contacts using phone numbers and emails. Built with Express.js, Prisma, and PostgreSQL, and deployed on Railway.

---

## 🚀 Live Demo

**Production URL:** [bitespeed-identity-production.up.railway.app](bitespeed-identity-production.up.railway.app)



---

## 💡 Overview

This service implements an API endpoint `/identify` that determines user identity by finding or linking existing contact records based on the provided `email` and/or `phoneNumber`.

It returns a normalized structure identifying the primary contact and related secondary contacts.

---

## 📂 Technologies Used

* **Node.js** + **Express.js**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL**
* **Railway** for deployment

---

## 🚧 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/avnisingh07/bitespeed-identity.git
cd bitespeed-identity
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/yourdbname
PORT=8080
```

### 4. Prisma Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the Server Locally

```bash
npm run dev
```

Visit `http://localhost:8080` to view the root endpoint.

---

## 🔗 API Endpoints

### `GET /`

Returns basic service information and available routes.

#### Example Response:

```json
{
  "message": "Bitespeed Identity Reconciliation Service",
  "version": "1.0.0",
  "endpoints": {
    "identify": {
      "method": "POST",
      "path": "/identify",
      "description": "Identify and reconcile contact information"
    }
  }
}
```

---

### `POST /identify`

Accepts an email and/or phone number to find or create user contact records.

#### Request Body:

```json
{
  "email": "john@example.com",
  "phoneNumber": "9876543210"
}
```

#### Response:

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["john@example.com"],
    "phoneNumbers": ["9876543210"],
    "secondaryContactIds": []
  }
}
```



---

## 📅 Test Scenarios

* New contact with unique email and phone
* Matching email only (existing contact)
* Matching phone only (existing contact)
* Consolidation of multiple primaries into one
* Exact match returns same response (idempotency)

---

## 🚄 Deployment

Deployed using [Railway](https://railway.app/):

* CI/CD integrated with GitHub
* Environment variables configured through Railway dashboard
* PostgreSQL provisioned via Railway plugin

---

## 📃 Project Structure

```
├── src/
│   └── index.ts          # Main Express server
├── prisma/
│   └── schema.prisma     # Prisma schema
├── .env                  # Environment variables
├── README.md
├── package.json
├── tsconfig.json
```

---

## 🚨 Graceful Shutdown

Handles `SIGINT` and `SIGTERM` for safe Prisma disconnection.

---

## 📧 Contact

**Author**: Avnisingh
**GitHub**: [@avnisingh07](https://github.com/avnisingh07)
