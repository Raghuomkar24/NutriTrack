# NutriTrack Pro – AI Powered Nutrition & Health Tracker

NutriTrack Pro is a premium, enterprise-grade full-stack health and nutrition tracking application. It integrates a secure Spring Boot 3 Java API with a sleek React.js TypeScript frontend using a modern glassmorphic theme.

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React (Vite) & TypeScript
- **Styling**: Tailwind CSS & Glassmorphic Custom UI Design
- **Router**: React Router Dom v6
- **Charts**: Recharts (Weight Progress, Hydration progress, Macro Distribution)
- **Icons & Animation**: Lucide React & Custom transitions

### Backend
- **Framework**: Spring Boot 3 (Java 21) & Spring Security
- **Data & Access**: Spring Data JPA & Hibernate
- **Database**: MySQL 8.0
- **Security**: JWT Stateless Authentication (BCrypt hashed credentials)
- **PDF Generation**: OpenPDF / LibrePDF
- **API Doc**: Springdoc Swagger / OpenAPI

---

## 🥑 Features Included

1. **Dashboard Home**: Real-time Animated SVG progress rings for daily calorie consumption, water logs, and workout metrics.
2. **Interactive Profiler**: Auto-calculates **BMI**, **BMR** (Mifflin-St Jeor), **TDEE**, and macro splits (30% Protein / 45% Carbs / 25% Fat) based on physical activity multipliers and goal selectors.
3. **Simulated Barcode Scanner**: Lookup food details by entering UPC barcodes. Integrated with the Open Food Facts API, caching new products in local database.
4. **AI plate Photo Segmenter**: Mock image segmenter to estimate meal composition, calories, and macros from photo uploads.
5. **AI Nutrition Coach**: Intelligent chatbot coach to answer nutrition labels, recommend alternative meals, or create daily plans.
6. **Grocery Planner**: Choose multiple checkboxed recipes to automatically aggregate ingredients and generate shopping checklists.
7. **Report Downloader**: Instantly downloads structured PDF scorecards of user progress logs.
8. **Admin Panel**: Restrictive dashboard to monitor total system status, manage catalog foods, and delete user profiles.

---

## 🔑 Default Credentials

- **Standard User**: `user@nutritrack.com` / `password123`
- **Administrator**: `admin@nutritrack.com` / `password123`

---

## 🐳 Quick Start: Docker Compose (Recommended)

To run the database, Spring Boot API, and React frontend concurrently:

1. Clone or copy the project files.
2. Open a terminal in the root folder.
3. Run:
   ```bash
   docker-compose up --build
   ```
4. Access the web app at: [http://localhost](http://localhost) (port 80).
5. Swagger API Docs: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 🛠️ Manual Launch Instructions

### 1. Database Setup
1. Create a MySQL database named `nutritrack_db`.
2. (Optional) Run the scripts `database/schema.sql` and `database/seed.sql` to populate the tables.

### 2. Backend Launch
1. Navigate to the `backend/` directory.
2. Update database parameters in `src/main/resources/application.yml` if necessary.
3. Start the application:
   ```bash
   mvn clean spring-boot:run
   ```
4. API will boot on: [http://localhost:8080](http://localhost:8080).

### 3. Frontend Launch
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
