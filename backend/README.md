# M365 Backup Backend

Backend API for an M365 Backup Dashboard built with Node.js, Express, MongoDB, Microsoft Graph API, and Wasabi.

## Features

- User registration & JWT authentication
- Microsoft 365 OAuth connection
- Microsoft Graph mailbox access
- Mail backup to Wasabi
- Backup job tracking
- Ex-employee mailbox archiving
- DPDP compliance PDF reports
- Backup search
- WhatsApp webhook
- Automated backup jobs with cron

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Microsoft MSAL & Graph API
- JWT + bcryptjs
- Wasabi / AWS S3 SDK
- PDFKit
- Axios
- node-cron

## Structure

```text
backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── app.js
├── .env
├── package.json
└── README.md

Main APIs
Method	Endpoint	Purpose
POST	/api/auth/register	Register user
POST	/api/auth/login	Login & receive JWT
GET	/api/tenant/connect-url	Connect Microsoft 365
GET	/api/tenant/callback	Microsoft OAuth callback
POST	/api/backup/start	Start backup
GET	/api/backup/jobs	Get backup jobs
POST	/api/archive/ex-employee	Archive ex-employee mailbox
GET	/api/compliance/dpdp-report	Generate DPDP report
POST	/api/search/ai	Search backup data
POST	/api/whatsapp/webhook	WhatsApp restore webhook
Environment Variables

Create a .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

MS_CLIENT_ID=your_microsoft_client_id
MS_CLIENT_SECRET=your_microsoft_client_secret
MS_REDIRECT_URI=http://localhost:5000/api/tenant/callback

WASABI_KEY=your_wasabi_access_key
WASABI_SECRET=your_wasabi_secret
WASABI_BUCKET=m365-backups

FRONTEND_URL=http://localhost:3000
PORT=5000


Installation
npm install
Run

Development:

npm run dev

Or:

node src/app.js

Backend runs on:

http://localhost:5000

Basic Flow
Frontend
   ↓
Express REST API
   ↓
MongoDB
   ↓
Microsoft Graph
   ↓
Wasabi Storage

The backend handles authentication, Microsoft 365 integration, backup storage, employee archiving, compliance reporting, search, and automated backup processing.
```
