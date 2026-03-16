# AASRA Web Dashboard 💻📊

![AASRA Web Dashboard Cover](placeholder_image_url_here)
*Caption: AASRA Admin Web Dashboard Overview.*

The **AASRA Web Dashboard** is the central command center for administrators managing disaster response efforts. Built with **React 19** and **Vite**, it offers a fast, responsive, and secure interface to monitor incoming reports, manage volunteers, track donations, and broadcast critical alerts.

This single-page application (SPA) connects directly to **Firebase Firestore** for real-time data synchronization and integrates with the AASRA AI Engine for smart report categorization.

---

## ✨ Key Features

*   **Real-time Analytics Dashboard**: Visualize disaster data, report statistics, and resource allocation using interactive charts (Powered by **Chart.js**).
*   **Secure Admin Authentication**: Protected routes ensuring that sensitive data is only accessible to authorized personnel via Firebase Authentication.
*   **Report Management**: View, filter, and take action on incoming crisis reports. Includes AI-verified status and priority tagging.
*   **Volunteer & Donation Tracking**: Dedicated modules to manage registered volunteers and track financial contributions.
*   **Broadcast System**: Send out mass alerts and notifications to users in affected areas.
*   **Data Export**: Export reports and data to PDF formats using **jsPDF** and CSV using **PapaParse**.

---

## 🛠️ Tech Stack & Dependencies

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

*   **Frontend Framework**: React 19, Vite
*   **Routing**: React Router DOM (v7)
*   **Styling**: Contextual CSS & Lucide React for iconography 
*   **Backend Services**: Firebase (Firestore, Auth)
*   **Data Visualization & Export**: React-Chartjs-2, Chart.js, jsPDF, PapaParse

---

## 🚀 Local Setup Instructions

Follow these instructions to run the web dashboard locally for development.

### Prerequisites
*   **Node.js** (v18 or higher recommended)
*   **npm** or **yarn** package manager

### Step 1: Clone the repository
Navigate to the web dashboard directory:
```bash
cd AASRA_web_dashboard
```

### Step 2: Install Dependencies
Run the following command to install all necessary NPM packages:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory (alongside `package.json`) and add your Firebase configuration details:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Run the Development Server
Start the Vite development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`. 

### Step 5: Build for Production
To create an optimized production build:
```bash
npm run build
```

---

## 📸 Application Images
*(Images to be added here)*

![Dashboard View](placeholder_image_url_here)
*Caption: Analyzing disaster reports and volunteer availability.*

![Reports View](placeholder_image_url_here)
*Caption: Detailed view of incoming, AI-verified emergency reports.*

---
*Created for the AASRA Final Year Project.*
