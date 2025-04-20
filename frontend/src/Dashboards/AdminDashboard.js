import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import Students from "./sections/Students";
import Drives from "./sections/Drives";
import Reports from "./sections/Reports";
import styles from "./AdminDashboard.module.css";
import analyticsStyles from "./Analytics.module.css"; // Import analytics-specific styles

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [section, setSection] = useState("analytics");
  const [analytics, setAnalytics] = useState({
    total_students: 0,
    vaccinated_students: 0,
    total_drives: 0,
    available_doses: 0,
  });
  const [vaccinationDrives, setVaccinationDrives] = useState([]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/analytics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Filter out completed drives from the analytics data
      const filteredDrives = res.data.vaccination_drives.filter(
        (drive) => !drive.is_completed // Only include non-completed drives
      );

      // Update analytics state with filtered data
      setAnalytics({
        total_students: res.data.total_students,
        vaccinated_students: res.data.vaccinated_students,
        total_drives: filteredDrives.length, // Count only non-completed drives
        available_doses: filteredDrives.reduce(
          (total, drive) => total + drive.available_doses,
          0
        ), // Sum available doses for non-completed drives
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  const fetchVaccinationDrives = async () => {
    try {
      const res = await axios.get("/drives/vaccination_drives");
      // Filter out completed drives
      const nonCompletedDrives = res.data.filter((drive) => !drive.is_completed);
      setVaccinationDrives(nonCompletedDrives);
    } catch (err) {
      console.error("Error fetching vaccination drives:", err);
    }
  };

  // Synchronize the section state with the URL path
  useEffect(() => {
    const path = location.pathname.replace("/", ""); // Remove the leading "/"
    setSection(path || "analytics"); // Default to "analytics" if no path is provided
  }, [location]);

  useEffect(() => {
    if (section === "analytics") {
      fetchAnalytics();
      fetchVaccinationDrives();
    }
  }, [section]);

  const handleNavigation = (newSection) => {
    setSection(newSection);
    navigate(`/${newSection}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the JWT token
    navigate("/"); // Redirect to the login page
  };

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <h2>Admin Panel</h2>
        <nav>
          <button
            onClick={() => handleNavigation("analytics")}
            className={`${styles.tabButton} ${section === "analytics" ? styles.activeTab : ""}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavigation("students")}
            className={`${styles.tabButton} ${section === "students" ? styles.activeTab : ""}`}
          >
            Manage Students
          </button>
          <button
            onClick={() => handleNavigation("drives")}
            className={`${styles.tabButton} ${section === "drives" ? styles.activeTab : ""}`}
          >
            Vaccination Drives
          </button>
          <button
            onClick={() => handleNavigation("reports")}
            className={`${styles.tabButton} ${section === "reports" ? styles.activeTab : ""}`}
          >
            Generate Reports
          </button>
        </nav>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className={styles.content}>
        {section === "analytics" && (
          <div className={analyticsStyles.analytics}>
            <h2>Analytics Dashboard</h2>
            <div className={analyticsStyles.cards}>
              <div
                className={analyticsStyles.card}
                onClick={() => handleNavigation("students")}
              >
                <h3>Total Students</h3>
                <p>{analytics.total_students}</p>
              </div>
              <div
                className={analyticsStyles.card}
                onClick={() => handleNavigation("students")}
              >
                <h3>Vaccinated Students</h3>
                <p>{analytics.vaccinated_students}</p>
              </div>
              <div
                className={analyticsStyles.card}
                onClick={() => handleNavigation("drives")}
              >
                <h3>Scheduled Drives</h3>
                <p>{analytics.total_drives}</p>
              </div>
              <div className={analyticsStyles.card}>
                <h3>Available Doses</h3>
                <p>{analytics.available_doses}</p>
              </div>
            </div>
            <div className={analyticsStyles.vaccinationDrives}>
              <h3>Upcoming Vaccination Drives</h3>
              {vaccinationDrives.length > 0 ? (
                <ul>
                  {vaccinationDrives.map((drive) => (
                    <li key={drive._id}>
                      {drive.vaccine_name} -{" "}
                      {drive.date
                        ? new Date(drive.date.$date || drive.date).toLocaleDateString()
                        : "Invalid Date"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming drives</p>
              )}
            </div>
          </div>
        )}
        {section === "students" && <Students />}
        {section === "drives" && <Drives />}
        {section === "reports" && <Reports />}
      </main>
    </div>
  );
};

export default AdminDashboard;
