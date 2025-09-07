import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import {Link} from "react-router-dom";

function Login() {
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/login", inputs);
      alert("Welcome " + res.data.name);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <section className="login" aria-label="Login">
      <div className="login-card">
        {/* Left segment: Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h1 className="login-title">Sign in</h1>

          <div className="form-group">
            <label htmlFor="email">Email / Username: </label>
            <input
              id="email"
              type="text"
              name="email"
              placeholder="Enter your email or username"
              value={inputs.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={inputs.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="login-actions">
            <button type="submit" className="login-btn">Login</button>
          </div>

          <p className="register-link">
            Don’t have an account? <Link to='/register'>Register</Link>
          </p>
        </form>

        {/* Right segment: Illustrative Image */}
        <div className="login-image">
          <img 
            src='Images/Data_security.jpg'
            alt="Login Illustration" 
          />
        </div>
      </div>
    </section>
  );
}

export default Login;
