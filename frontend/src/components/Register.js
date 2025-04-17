import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css"; // Import the CSS module

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", role: "admin" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/register", form);
      setMessage(res.data.msg);
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Registration failed");
    }
  };

  const handleBackToLogin = () => {
    navigate("/login"); // Navigate back to the login page
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Register</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
      <button type="button" 
      onClick={handleBackToLogin} 
      className={styles.backButton}>
        Back to Login
      </button>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default Register;
