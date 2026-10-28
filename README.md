# User Management & Dashboard System (Digital Twin Assignment)

A full-stack User Management and Analytics Dashboard application built with **React, TypeScript, Vite** on the frontend and **Node.js, Express, MongoDB** on the backend.

---

## 📋 Features

- **Dashboard**: View high-level metrics (Total Users, Active, Inactive, Role distribution).
- **User Management**:
  - Browse users with pagination and search.
  - Create, view, edit, and delete users with real-time feedback.
  - Role management (`admin`, `editor`, `viewer`) and status tracking (`active`, `inactive`).
- **Customizable Theme**: Real-time theme customization support.
- **RESTful API**: Clean Express architecture with MongoDB Mongoose schemas, Zod validation, and error handling.
- **Database Seeding**: Ready-to-use sample dataset with 25+ users for quick testing.

---

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **Styling**: Vanilla CSS (Modern design system, dark/light theme support)

### Server (Backend)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Development**: Nodemon

---

## ⚙️ Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string.

---

## 🚀 Setup & Installation Steps

### 1. Clone or Open the Repository
```bash
git clone <repository-url>
cd DigitalTwinAssignment
```

---

### 2. Backend Setup (`server`)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `server` directory (if not already present):
   ```env
   PORT=5000
   MONGODB_URI="mongodb://127.0.0.1:27017/user_dashboard"
   ```
   > **Note:** If using MongoDB Atlas, replace `MONGODB_URI` with your connection string.

4. Seed the Database (Optional but recommended):
   Populate the database with sample user data:
   ```bash
   npm run seed
   ```

5. Start the Backend Server:
   - In Development mode (with nodemon auto-reload):
     ```bash
     npm run dev
     ```
   - In Production mode:
     ```bash
     npm run start
     ```
   The backend API will run on **`http://localhost:5000`**.

---

### 3. Frontend Setup (`client`)

1. Open a second terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the `client` directory:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

4. Start the Frontend Development Server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints Summary

Base URL: `http://localhost:5000/api/users`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | List users (supports `?page=`, `?limit=`, `?search=`) |
| `GET` | `/api/users/stats` | Get aggregate user statistics |
| `GET` | `/api/users/:id` | Get details of a single user by ID |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/:id` | Update an existing user |
| `DELETE` | `/api/users/:id` | Delete a user |

---

## 📁 Project Structure

```text
DigitalTwinAssignment/
├── client/
│   ├── src/
│   │   ├── api/            # API services and HTTP client
│   │   ├── context/        # React Context providers (UsersContext)
│   │   ├── pages/          # App pages (Dashboard, Users, etc.)
│   │   ├── theme/          # Theme context and tokens
│   │   ├── types/          # TypeScript interface definitions
│   │   ├── App.tsx         # Main application component & routes
│   │   └── main.tsx        # React DOM entry point
│   ├── .env.local          # Frontend environment config
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/         # Database connection configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middlewares (error handling, etc.)
│   │   ├── models/         # Mongoose models (User schema)
│   │   ├── routes/         # Express API routes
│   │   ├── validators/     # Zod schema validation
│   │   ├── app.js          # Express app definition
│   │   ├── index.js        # Server listener entry point
│   │   └── seed.js         # Seed database script
│   ├── .env                # Backend environment config
│   └── package.json
│
└── README.md
```

---

## 🧪 Building for Production

### Client
```bash
cd client
npm run build
