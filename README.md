# CredCheck

Certificate & Internship Verifier for Students

## Project Description

CredCheck is a full-stack web application that enables students to upload certificates, verifiers to review and validate them, and admins to manage users and view reports. Verified certificates receive a public link and QR code for easy sharing and verification.

## Features

### Student
- Google Login
- Profile management
- Upload certificates
- View certificate PDF
- Download certificate PDF
- Delete certificate
- QR code for verified certificates
- Public certificate link

### Verifier
- Registration with OTP verification
- Login using Email + Password + OTP
- OTP resend
- Dashboard with assigned certificates
- View PDF
- Download PDF
- Approve / Reject certificates
- Add comments on rejection
- Profile management

### Admin
- Login using Email + Password + OTP
- Dashboard statistics
- Manage students
- Manage verifiers
- Approve / Reject verifier requests
- Trusted organization toggle
- View all certificates
- View PDF
- Download PDF
- Reports management
- Profile management

### Public
- Public certificate link
- QR code scanning
- Certificate verification page
- Report abuse

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, Google OAuth, Email OTP
- **File Storage:** Cloudinary
- **QR Codes:** qrcode
- **PDF Handling:** adm-zip, axios

## Folder Structure

```
credcheck/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .env
├── README.md
└── .gitignore
```

## Installation Steps

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

## Environment Variables

### Server (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `CLIENT_URL` - Frontend URL for QR codes and public links
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `EMAIL_SERVICE` - Email service (e.g., gmail)
- `EMAIL_USER` - Sender email address
- `EMAIL_PASS` - Email app password

### Client (.env)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `VITE_API_URL` - Backend API URL
- `VITE_CLIENT_URL` - Frontend URL

## Running the Application

### Frontend
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend
```bash
cd server
npm run dev
```
The backend will be available at `http://localhost:5000`

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the **Root Directory** to `client`
3. Add environment variables in Vercel dashboard:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_URL` (your Render backend URL)
   - `VITE_CLIENT_URL` (your Vercel frontend URL)
4. Deploy

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Set the **Root Directory** to `server`
4. Set the **Build Command** to `npm install`
5. Set the **Start Command** to `npm start`
6. Add environment variables in Render dashboard:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `EMAIL_SERVICE`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CLIENT_URL` (your Vercel frontend URL)
7. Deploy

### Database (MongoDB Atlas)
1. Create a cluster on MongoDB Atlas
2. Get the connection string
3. Add it as `MONGO_URI` in your Render environment variables

### Cloudinary
1. Create an account on Cloudinary
2. Get your cloud name, API key, and API secret
3. Add them as environment variables in Render
