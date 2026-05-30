## Financeku 💰

Financeku is a web-based personal finance management application designed to help users efficiently record daily income and expenses. This application is equipped with an automatic balance summary dashboard, transaction data management, and visualization of spending statistics using interactive graphs.

This application is fully containerized using Docker, making it very easy to run in a local development environment without the need for manual database installation.

---

## 🚀 Key Features

* Executive Summary Dashboard: Displays Total Balance, Total Income, Total Expenses, and the current month's Transaction Amount in real-time.
* Transaction Management: Complete transaction recording form (Income/Expenses) with nominal input validation, category assignment, and additional notes.
* Statistical Visualization: Interactive pie charts that map the percentage distribution of expenses by category to facilitate financial analysis.

* Dark Mode: An interface that supports switching between light and dark themes for user visual comfort.
* Docker-Ready Architecture: Easy local deployment for both the frontend and backend with just one command.

---

## 🛠️ Technologies Used

### Frontend
* **React.js** (Vite)
* **Tailwind CSS** (UI Design & Dark Mode)
* **Recharts** (Interactive Statistical Charts)
* **Axios** (HTTP Client for API Communication)
* **Lucide React** (Icon Collection)

### Backend & Database
* **Node.js** with **Express.js** (RESTful API)
* **SQLite** (Lightweight and efficient local database)

### DevOps / Deployment
* **Docker** & **Docker Compose**

---

## 📦 Installation & How-To Guide

Make sure you have **Docker** and **Docker Desktop** installed on your computer before starting.

### 1. Clone the Repository
```bash
git clone https://github.com/Aryaraf/Financeku.git
cd Financeku
```

### 2. Run Using Docker Compose
You don't need to manually install Node.js or any dependencies on your local computer. Simply run the following command in the terminal:

```bash
docker-compose up --build
```

The above command will automatically download the image, build the containers for both the frontend and backend, and connect them to the SQLite database.

### 3. Access the Application
After the build process is complete and the container is running successfully, open your browser and access the following address:

* **Frontend (Web Application)**: `http://localhost:5173`
* **Backend (API Server)**: `http://localhost:3000`

---

## 📂 Project Structure

```text
finance-app/
├── backend/
│ ├── data/ 
│ ├── Dockerfile
│ ├── package.json
│ └── server.js 
├── frontend/
│ ├── src/
│ │ ├── App.jsx 
│ │ └── main.jsx
│ ├── Dockerfile
│ ├── package.json
│ └── tailwind.config.js
├── .gitignore # Git exclusion file
└── docker-compose.yml 
```

---

## 📝 Development Notes

* The backend application runs on port `3000` and exposes the main endpoint at `/api/transactions`.

* If you make code changes or refactorings on the *frontend* or *backend* side, make sure to always rebuild the container using the `docker-compose up --build` command so that the changes are immediately applied in Docker.