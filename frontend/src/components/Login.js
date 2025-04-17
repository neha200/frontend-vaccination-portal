import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { saveToken, getRole } from "../auth/auth";
import styles from "./Login.module.css";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/login", form);
      saveToken(res.data.access_token);
      const role = getRole();
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        console.error("Invalid role");
      }
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirect to the register page
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginForm}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <input
          name="username"
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      <button
        type="button"
        onClick={handleRegisterRedirect}
        className={styles.registerButton}
      >
        Register
      </button>
    </div>
    </div>
  );
};

export default Login;
