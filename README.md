AI-Powered RFP Management System
It demonstrates an end-to-end AI-driven procurement workflow where natural language descriptions are converted into structured RFPs, emailed to vendors, vendor replies are parsed using AI, and proposals are scored automatically.

Key Features
🔹 1. AI-Based RFP Generation

User enters free text like:

“We need 30 laptops, 3 lakh budget, delivery in 15 days.”

The system uses Groq (Llama 3.1) to generate:

Title & description

Budget

Delivery timeline

Payment terms

Warranty

Item list

Stored via PostgreSQL + Prisma.

🔹 2. Vendor Management

Add vendors (name + email) and list all vendors.

APIs:

POST /api/vendors

GET /api/vendors

🔹 3. Email RFP to Vendors

RFP is emailed to all vendors via Mailtrap SMTP using Nodemailer.

API:

POST /api/rfps/:id/send

🔹 4. AI Vendor Reply Parsing

Vendor replies such as:

“We can do 92,000 INR, delivery 12 days, 2-year warranty.”

The AI extracts:

Price

Delivery days

Warranty

Notes

Stored as VendorResponse.

API:

POST /api/vendors/:vendorId/rfps/:rfpId/reply

🔹 5. Proposal Scoring Engine

Vendor proposals are scored using:

Factor	Weight
Price (lower better)	50%
Delivery Days (faster better)	30%
Warranty (longer better)	20%

Final score is 0–100.

API:

GET /api/rfps/:id/score

🔹 6. React Frontend

Three simple screens:

Generate RFP

Manage Vendors

View Scores & Rankings

Built with React + Vite + TypeScript.

🧱 Tech Stack

Node.js + Express

TypeScript

PostgreSQL + Prisma

Groq AI (Llama 3.1)

Nodemailer (Mailtrap)

React + Vite + TypeScript

⚙️ How to Run
Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

Frontend
cd frontend
npm install
npm run dev
