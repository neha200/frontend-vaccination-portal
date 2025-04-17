# School Vaccination Portal

## 📚 Overview
The **School Vaccination Portal** is a web-based application designed to manage vaccination drives for students. It provides features for administrators to manage students, vaccination drives, and generate reports, while ensuring secure access through role-based authentication.

---

## 🛠️ Features
### Admin Features
- **Student Management**:
  - Add, edit, and delete student records.
  - Bulk upload students via CSV.
  - Mark students as vaccinated.
- **Vaccination Drives**:
  - Create, edit, and delete vaccination drives.
  - Automatically mark past drives as completed.
- **Reports**:
  - Generate vaccination reports.
  - Export reports in CSV, Excel, and PDF formats.
- **Analytics Dashboard**:
  - View total students, vaccinated students, scheduled drives, and available doses.

### Authentication
- Role-based access control using JWT.
- Admin-only access to protected routes.

---

## 🏗️ Tech Stack
### Frontend
- **React**: For building the user interface.
- **Axios**: For API requests.
- **React Router**: For navigation.
- **CSS Modules**: For styling.

### Backend
- **Flask**: For building the REST API.
- **MongoDB**: For database management.
- **Flask-JWT-Extended**: For authentication.
- **Flask-CORS**: For handling cross-origin requests.

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** and **npm** for the frontend.
- **Python 3.x** and **pip** for the backend.
- **MongoDB** for the database.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend-vaccination-portal/backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```bash
   python app.py
   ```
4. The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend-vaccination-portal/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm start
   ```
4. The frontend will run on `http://localhost:3000`.

---

## 📂 Project Structure

### Frontend
```
frontend/
├── .gitignore                # Files and directories to ignore in version control
├── package.json              # Project metadata and dependencies
├── README.md                 # Frontend-specific documentation
├── public/                   # Static assets served directly
│   └── sample_students.csv   # Sample CSV for bulk student upload
├── src/                      # Source code for the React app
│   ├── App.js                # Main React component
│   ├── index.js              # Entry point for the React app
│   ├── api/                  # API utilities
│   │   └── axios.js          # Axios instance with interceptors
│   ├── auth/                 # Authentication utilities
│   │   ├── auth.js           # Token management and role extraction
│   │   └── ProtectedRoute.js # Component for role-based route protection
│   ├── components/           # Reusable components
│   │   ├── Login.js          # Login page
│   │   ├── Login.module.css  # Styles for the Login page
│   │   ├── Register.js       # Registration page
│   │   └── Register.module.css # Styles for the Registration page
│   ├── Dashboards/           # Admin dashboard and related sections
│   │   ├── AdminDashboard.js # Main admin dashboard component
│   │   ├── AdminDashboard.module.css # Styles for the admin dashboard
│   │   ├── Analytics.module.css # Styles for analytics cards
│   │   └── sections/         # Dashboard sections
│   │       ├── Students.js   # Manage students section
│   │       ├── Students.module.css # Styles for the students section
│   │       ├── Drives.js     # Manage vaccination drives section
│   │       ├── Drives.module.css # Styles for the drives section
│   │       ├── Reports.js    # Generate reports section
│   │       └── Reports.module.css # Styles for the reports section
│   ├── hooks/                # Custom React hooks
│   │   └── usePagination.js  # Pagination logic for tables

```
---

## 🔑 Authentication
- **JWT** is used for secure authentication.
- Tokens are stored in `localStorage` on the frontend.
- Protected routes are accessible only to authorized roles.

---

## 📊 API Endpoints
### Authentication
- `POST /login`: Login and get a JWT token.
- `POST /register`: Register a new user (admin only).

### Students
- `GET /students`: List all students.
- `POST /students`: Add a new student.
- `POST /students/bulk`: Bulk upload students via CSV.
- `PUT /students/<id>/vaccinate`: Mark a student as vaccinated.

### Vaccination Drives
- `GET /drives`: List all drives.
- `POST /drives`: Create a new drive.
- `PUT /drives/<id>`: Update a drive.
- `DELETE /drives/<id>`: Delete a drive.

### Analytics
- `GET /analytics`: Fetch dashboard analytics.

---

## 🧪 Testing
- Use **Postman** or any REST client to test the API.
- Include the JWT token in the `Authorization` header:
  ```
  Authorization: Bearer <your_token>
  ```

---

## 📦 Deployment
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the backend and frontend to your preferred hosting service.

---

## 🧑‍💻 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is licensed under the MIT License.