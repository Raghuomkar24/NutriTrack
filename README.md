# NutriTrack Pro – AI Powered Nutrition & Health Tracker

NutriTrack Pro is a premium, enterprise-grade full-stack health and nutrition tracking application. It integrates a Node.js Express API and MongoDB database with a sleek, responsive React.js TypeScript frontend using a modern glassmorphic theme.

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React (Vite) & TypeScript
- **Styling**: Tailwind CSS & Glassmorphic Custom UI Design
- **Router**: React Router Dom v6
- **Charts**: Recharts (Weight Progress, Hydration progress, Macro Distribution)
- **Icons & Animation**: Lucide React & Framer Motion transitions

### Backend
- **Framework**: Node.js & Express
- **Database**: MongoDB & Mongoose (with automatic fallback to persistent local db via `mongodb-memory-server` if Atlas is unreachable)
- **Security**: JWT Stateless Authentication (BCrypt hashed credentials)
- **PDF Generation**: PDFKit for clean, customized PDF reports
- **Image Recognition & AI Coach**: Google Gemini API integration (`@google/genai`)
- **Multipart Uploads**: Multer (handling profile picture updates and AI meal scanners)

---

## 🥑 Features Included

1. **Dashboard Home**: Real-time progress rings for daily calorie consumption, water logs, and workout metrics, plus a dynamic **Download PDF Report** button.
2. **Interactive Profiler**: Auto-calculates **BMI**, **BMR** (Mifflin-St Jeor), **TDEE**, and macro splits (30% Protein / 45% Carbs / 25% Fat) based on physical activity multipliers and goal selectors.
3. **Simulated Barcode Scanner**: Lookup food details by entering UPC barcodes. Integrated with the Open Food Facts API, caching new products in the MongoDB database.
4. **AI plate Photo Segmenter**: Gemini-powered image segmenter to estimate meal composition, calories, and macros from photo uploads.
5. **AI Nutrition Coach ("Ria")**: Intelligent chatbot coach to answer nutrition labels, recommend alternative meals, or create daily plans.
6. **Grocery Planner**: Choose multiple checkboxed recipes to automatically aggregate ingredients and generate shopping checklists.
7. **Report Downloader**: Instantly downloads structured PDF scorecards of user progress logs.
8. **Admin Panel**: Restrictive dashboard to monitor total system status, manage catalog foods, and delete user profiles.

---

## 🔑 Default Credentials

- **Standard User**: `user@nutritrack.com` / `password123`
- **Administrator**: `admin@nutritrack.com` / `password123`

---

## 🐳 Quick Start: Docker Compose (Recommended)

To run the database, Node.js API, and React frontend concurrently:

1. Clone or copy the project files.
2. Open a terminal in the root folder.
3. Run:
   ```bash
   docker-compose up --build
   ```
4. Access the web app at: [http://localhost](http://localhost) (port 80).

---

## 🛠️ Manual Launch Instructions

### 1. Backend Launch
1. Navigate to the `backend/` directory.
2. Create or verify a `.env` file containing:
   ```env
   PORT=8085
   MONGO_URI="your-mongodb-connection-string"
   JWT_SECRET="your-jwt-signing-secret"
   GEMINI_API_KEY="your-google-gemini-api-key"
   ```
   *(Note: If the `MONGO_URI` is unreachable or not provided, the backend automatically spins up a persistent, local SQLite-like MongoDB database in the `backend/local_db_data` directory)*.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. The API will boot on: [http://localhost:8085](http://localhost:8085).

### 2. Frontend Launch
1. Navigate to the `frontend/` directory.
2. Install packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the React console at: [http://localhost:5173](http://localhost:5173).
